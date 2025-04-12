// hooks/useSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import socketService from '../services/socketService';

interface UseSocketOptions {
  autoConnect?: boolean;
  events?: Record<string, (...args: any[]) => void>;
}

/**
 * Socket.IO 연결 및 이벤트를 관리하는 커스텀 훅
 * @param options 설정 옵션
 */
export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, events = {} } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const eventsRef = useRef(events);

  // 이벤트 참조 업데이트
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // 연결 상태 업데이트 핸들러
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setError(null);
    setIsLoading(false);
  }, []);

  // 연결 오류 핸들러
  const handleError = useCallback((err: Error) => {
    setError(err.message);
    setIsLoading(false);
  }, []);

  // 연결 해제 핸들러
  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setIsLoading(false);
  }, []);

  // 소켓 연결 함수
  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await socketService.init();
      setIsConnected(socketService.isConnected());
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '연결 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  }, []);

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
  }, []);

  // 이벤트 발신 함수
  const emit = useCallback((event: string, data?: any) => {
    if (!isConnected) {
      console.warn('소켓이 연결되지 않았습니다.');
      return;
    }
    socketService.emit(event, data);
  }, [isConnected]);

  // 컴포넌트 마운트/언마운트 시 이벤트 리스너 설정
  useEffect(() => {
    // 연결 이벤트 리스너
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleError);
    socketService.on('error', handleError);
    
    // 사용자 정의 이벤트 리스너 등록
    Object.entries(eventsRef.current).forEach(([event, callback]) => {
      socketService.on(event, callback);
    });

    // 자동 연결 설정이 있으면 연결
    if (autoConnect && !socketService.isConnected()) {
      connect();
    }

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleError);
      socketService.off('error', handleError);
      
      // 사용자 정의 이벤트 리스너 제거
      Object.entries(eventsRef.current).forEach(([event, callback]) => {
        socketService.off(event, callback);
      });
    };
  }, [handleConnect, handleDisconnect, handleError, connect, autoConnect]);

  return {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    emit,
    // 추가 이벤트 수신 함수를 등록
    on: socketService.on,
    off: socketService.off
  };
};

export default useSocket;