// __tests__/hooks/useSocket.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import socketService from '../../src/services/socketService';
import useSocket from '../../src/hooks/useSocket';

// socketService 모킹
jest.mock('../../src/services/socketService', () => {
  const originalModule = jest.requireActual('../../src/services/socketService');
  return {
    ...originalModule,
    init: jest.fn(),
    disconnect: jest.fn(),
    isConnected: jest.fn(() => false),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };
});

describe('useSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (socketService.isConnected as jest.Mock).mockReturnValue(false);
    (socketService.on as jest.Mock).mockImplementation((event, callback) => {
      // 모의 이벤트 리스너 등록만 하고, 실행은 별도로 처리
    });
  });

  it('autoConnect=true로 초기화하면 자동으로 연결된다', async () => {
    // 모의 성공적인 연결
    (socketService.init as jest.Mock).mockResolvedValue(undefined);
    
    const { result } = renderHook(() => 
      useSocket({ autoConnect: true })
    );
    
    // 초기 상태
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe(null);
    
    // Init 호출 되었는지 확인
    expect(socketService.init).toHaveBeenCalled();
    
    // 연결 성공 시뮬레이션
    (socketService.isConnected as jest.Mock).mockReturnValue(true);
    
    // connect 이벤트 시뮬레이션
    act(() => {
      // socketService.on에 등록된 콜백 함수 실행
      const calls = (socketService.on as jest.Mock).mock.calls;
      const connectCallback = calls.find(call => call[0] === 'connect')?.[1];
      if (connectCallback) connectCallback();
    });
    
    // 성공 상태 확인
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('autoConnect=false로 초기화하면 자동으로 연결되지 않는다', () => {
    const { result } = renderHook(() => 
      useSocket({ autoConnect: false })
    );
    
    expect(socketService.init).not.toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('연결 실패 시 에러 상태를 설정한다', () => {
    const testError = new Error('연결 실패');
    (socketService.init as jest.Mock).mockRejectedValue(testError);
    
    const { result } = renderHook(() => 
      useSocket({ autoConnect: true })
    );
    
    // 초기 상태 확인
    expect(result.current.isLoading).toBe(true);
    
    // 오류 이벤트 시뮬레이션
    act(() => {
      const calls = (socketService.on as jest.Mock).mock.calls;
      const errorCallback = calls.find(call => call[0] === 'connect_error')?.[1];
      if (errorCallback) errorCallback(testError);
    });
    
    expect(result.current.error).toBe('연결 실패');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isConnected).toBe(false);
  });

  it('connect 메서드로 수동 연결할 수 있다', async () => {
    (socketService.init as jest.Mock).mockResolvedValue(undefined);
    
    const { result } = renderHook(() => 
      useSocket({ autoConnect: false })
    );
    
    // 수동 연결 시도
    await act(async () => {
      result.current.connect();
    });
    
    expect(socketService.init).toHaveBeenCalled();
    
    // 연결 성공 시뮬레이션
    (socketService.isConnected as jest.Mock).mockReturnValue(true);
    
    // connect 이벤트 시뮬레이션
    act(() => {
      const calls = (socketService.on as jest.Mock).mock.calls;
      const connectCallback = calls.find(call => call[0] === 'connect')?.[1];
      if (connectCallback) connectCallback();
    });
    
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('disconnect 메서드로 연결을 종료할 수 있다', () => {
    (socketService.isConnected as jest.Mock).mockReturnValue(true);
    
    const { result } = renderHook(() => 
      useSocket()
    );
    
    // 연결 상태 시뮬레이션
    act(() => {
      const calls = (socketService.on as jest.Mock).mock.calls;
      const connectCallback = calls.find(call => call[0] === 'connect')?.[1];
      if (connectCallback) connectCallback();
    });
    
    // 연결 종료
    act(() => {
      result.current.disconnect();
    });
    
    expect(socketService.disconnect).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
  });

  it('emit 메서드로 이벤트를 전송할 수 있다', () => {
    (socketService.isConnected as jest.Mock).mockReturnValue(true);
    
    const { result } = renderHook(() => 
      useSocket()
    );
    
    // 연결 상태 시뮬레이션
    act(() => {
      const calls = (socketService.on as jest.Mock).mock.calls;
      const connectCallback = calls.find(call => call[0] === 'connect')?.[1];
      if (connectCallback) connectCallback();
    });
    
    // 이벤트 전송
    act(() => {
      result.current.emit('test-event', { message: 'Hello' });
    });
    
    expect(socketService.emit).toHaveBeenCalledWith('test-event', { message: 'Hello' });
  });

  it('연결되지 않은 상태에서 emit을 호출하면 경고 로그를 출력한다', () => {
    // 콘솔 경고 모킹
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    (socketService.isConnected as jest.Mock).mockReturnValue(false);
    
    const { result } = renderHook(() => 
      useSocket({ autoConnect: false })
    );
    
    // 연결되지 않은 상태에서 emit 호출
    result.current.emit('test-event', { message: 'Hello' });
    
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(socketService.emit).not.toHaveBeenCalled();
    
    // 스파이 복원
    consoleWarnSpy.mockRestore();
  });

  it('on과 off 메서드로 이벤트 리스너를 등록하고 제거할 수 있다', () => {
    const { result } = renderHook(() => 
      useSocket({ autoConnect: false })
    );
    
    const mockCallback = jest.fn();
    
    // 이벤트 리스너 등록
    result.current.on('test-event', mockCallback);
    
    expect(socketService.on).toHaveBeenCalledWith('test-event', mockCallback);
    
    // 이벤트 리스너 제거
    result.current.off('test-event', mockCallback);
    
    expect(socketService.off).toHaveBeenCalledWith('test-event', mockCallback);
  });

  it('events 옵션으로 전달된 이벤트 리스너가 등록된다', () => {
    const mockEventCallback = jest.fn();
    
    renderHook(() => 
      useSocket({
        autoConnect: false,
        events: {
          'test-event': mockEventCallback
        }
      })
    );
    
    // 이벤트 핸들러가 등록되었는지 확인
    expect(socketService.on).toHaveBeenCalledWith('test-event', mockEventCallback);
  });
});