// __tests__/hooks/useNotification.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useNotificationManager } from '../../src/hooks/useNotification';
import { useNotification } from '../../src/contexts/NotificationContext';
import notificationService from '../../src/services/api/notificationService';

// 모킹
jest.mock('../../src/contexts/NotificationContext', () => ({
  useNotification: jest.fn(),
}));

jest.mock('../../src/services/api/notificationService', () => ({
  getNotifications: jest.fn(),
}));

describe('useNotificationManager', () => {
  // 기본 모킹 값 설정
  const mockNotifications = [
    { id: 1, content: 'Test notification 1', is_read: false, notification_type: 'system', created_at: '2023-01-01' },
    { id: 2, content: 'Test notification 2', is_read: true, notification_type: 'like', created_at: '2023-01-02' },
  ];
  
  const mockContextFunctions = {
    notifications: mockNotifications,
    unreadCount: 1,
    fetchNotifications: jest.fn().mockResolvedValue(undefined),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 컨텍스트 훅 모킹
    (useNotification as jest.Mock).mockReturnValue(mockContextFunctions);
    
    // 서비스 함수 모킹
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: {
        notifications: mockNotifications,
        total: 2,
        unread: 1,
      },
    });
  });

  it('should return context values and local state', () => {
    const { result } = renderHook(() => useNotificationManager());
    
    // 초기 상태 확인
    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch notifications with pagination', async () => {
    const { result } = renderHook(() => useNotificationManager());
    
    let responseData: any;
    
    await act(async () => {
      responseData = await result.current.fetchNotifications(1, 10);
    });
    
    // API 호출 확인
    expect(notificationService.getNotifications).toHaveBeenCalledWith({ page: 1, limit: 10 });
    
    // 컨텍스트 업데이트 함수 호출 확인
    expect(mockContextFunctions.fetchNotifications).toHaveBeenCalled();
    
    // 반환값 확인
    expect(responseData).toEqual({
      notifications: mockNotifications,
      total: 2,
      unread: 1,
    });
  });

  it('should handle error during fetch', async () => {
    // 에러 발생 모킹
    const testError = new Error('API error');
    (notificationService.getNotifications as jest.Mock).mockRejectedValueOnce(testError);
    
    const { result } = renderHook(() => useNotificationManager());
    
    // 에러 처리 테스트
    await act(async () => {
      try {
        await result.current.fetchNotifications();
      } catch (error) {
        // 에러 무시 - 훅 내부에서 처리됨
      }
    });
    
    // 에러 상태 확인 - loading은 완료되고 error 상태가 설정되어야 함
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('API error');
  });

  it('should handle non-Error objects in error case', async () => {
    // 문자열 에러 모킹
    (notificationService.getNotifications as jest.Mock).mockRejectedValueOnce('String error');
    
    const { result } = renderHook(() => useNotificationManager());
    
    // 에러 처리 테스트
    await act(async () => {
      try {
        await result.current.fetchNotifications();
      } catch (error) {
        // 에러 무시
      }
    });
    
    // 기본 에러 메시지 사용 확인
    expect(result.current.error).toBe('알림을 불러오는 중 오류가 발생했습니다.');
  });

  it('should pass through context functions', () => {
    const { result } = renderHook(() => useNotificationManager());
    
    // 컨텍스트 함수 전달 확인
    result.current.markAsRead(1);
    expect(mockContextFunctions.markAsRead).toHaveBeenCalledWith(1);
    
    result.current.markAllAsRead();
    expect(mockContextFunctions.markAllAsRead).toHaveBeenCalled();
    
    result.current.deleteNotification(1);
    expect(mockContextFunctions.deleteNotification).toHaveBeenCalledWith(1);
  });

  it('should handle fetch with default pagination parameters', async () => {
    const { result } = renderHook(() => useNotificationManager());
    
    await act(async () => {
      await result.current.fetchNotifications();
    });
    
    // 기본 파라미터로 호출 확인
    expect(notificationService.getNotifications).toHaveBeenCalledWith({ page: undefined, limit: undefined });
    
    // 컨텍스트 함수 호출 확인
    expect(mockContextFunctions.fetchNotifications).toHaveBeenCalled();
  });
});