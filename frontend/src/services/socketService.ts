// services/socketService.ts
import { io, Socket } from 'socket.io-client'; // 패키지를 설치해야 함
import authService from './api/authService';

/**
 * Socket.IO 연결 및 이벤트 처리를 위한 서비스
 */
class SocketService {
  private socket: Socket | null = null;
  private connectPromise: Promise<void> | null = null;
  private resolveConnect: (() => void) | null = null;
  private rejectConnect: ((error: Error) => void) | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3초

  /**
   * Socket.IO 연결 초기화
   */
  public init = async (): Promise<void> => {
    if (this.socket && this.socket.connected) {
      return Promise.resolve();
    }

    // 이전 연결 시도가 있으면 중지
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // 새로운 연결 Promise 생성
    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.resolveConnect = resolve;
      this.rejectConnect = reject;
    });

    try {
      // authService에서 토큰 가져오기
      // getToken 함수 대신 인증 정보를 직접 가져옴
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
      }

      const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      
      this.socket = io(socketUrl, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      // 연결 이벤트 핸들러
      this.socket.on('connect', this.handleConnect);
      this.socket.on('connect_error', this.handleConnectError);
      this.socket.on('disconnect', this.handleDisconnect);
      this.socket.on('error', this.handleError);

      // 재시도 카운터 초기화
      this.reconnectAttempts = 0;
      
      return this.connectPromise;
    } catch (error) {
      if (this.rejectConnect) {
        this.rejectConnect(error as Error);
      }
      throw error;
    }
  };

  /**
   * 연결 해제
   */
  public disconnect = (): void => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  };

  /**
   * 이벤트 수신 리스너 등록
   * @param event 이벤트 이름
   * @param callback 콜백 함수
   */
  public on = (event: string, callback: (...args: any[]) => void): void => {
    if (!this.socket) {
      console.error('소켓이 초기화되지 않았습니다. init()을 먼저 호출하세요.');
      return;
    }
    this.socket.on(event, callback);
  };

  /**
   * 이벤트 수신 리스너 제거
   * @param event 이벤트 이름
   * @param callback 콜백 함수 (선택 사항)
   */
  public off = (event: string, callback?: (...args: any[]) => void): void => {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  };

  /**
   * 이벤트 전송
   * @param event 이벤트 이름
   * @param data 전송할 데이터
   */
  public emit = (event: string, data?: any): void => {
    if (!this.socket || !this.socket.connected) {
      console.error('소켓이 연결되지 않았습니다.');
      return;
    }
    this.socket.emit(event, data);
  };

  /**
   * 연결 상태 확인
   */
  public isConnected = (): boolean => {
    return !!this.socket && this.socket.connected;
  };

  // 내부 이벤트 핸들러
  private handleConnect = (): void => {
    console.log('소켓 연결됨');
    if (this.resolveConnect) {
      this.resolveConnect();
    }
  };

  private handleConnectError = (error: Error): void => {
    console.error('소켓 연결 오류:', error.message);
    this.attemptReconnect();
  };

  private handleDisconnect = (reason: string): void => {
    console.log('소켓 연결 해제됨. 이유:', reason);
    if (reason === 'io server disconnect') {
      // 서버에서 명시적으로 연결을 끊었으므로 자동 재연결 시도하지 않음
    } else {
      this.attemptReconnect();
    }
  };

  private handleError = (error: Error): void => {
    console.error('소켓 오류:', error.message);
    if (this.rejectConnect) {
      this.rejectConnect(error);
    }
  };

  private attemptReconnect = (): void => {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('최대 재연결 시도 횟수 초과');
      return;
    }

    this.reconnectAttempts++;
    console.log(`${this.reconnectAttempts}번째 재연결 시도 (${this.reconnectDelay / 1000}초 후)...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.init().catch(error => {
        console.error('재연결 실패:', error.message);
      });
    }, this.reconnectDelay);
  };
}

// 싱글톤 인스턴스
const socketService = new SocketService();

export default socketService;