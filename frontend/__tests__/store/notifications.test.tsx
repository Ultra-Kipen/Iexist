import { 
    fetchNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification,
    Notification
  } from '../../src/store/notifications';
  import { ActionType } from '../../src/store/types';
  import { handleApiError } from '../../src/utils/error';

  // Mock handleApiError
  jest.mock('../../src/utils/error', () => ({
    handleApiError: jest.fn((error) => {
      return { message: error.message || '알 수 없는 오류' };
    })
  }));
  
  // Mock fetch
  const mockFetch = jest.fn();
  global.fetch = mockFetch;
  
  describe('알림 관련 함수', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    describe('fetchNotifications', () => {
      const dispatch = jest.fn();
      
      test('알림 목록 가져오기 성공 시 각 알림을 상태에 추가한다', async () => {
        const mockNotifications: Notification[] = [
          {
            id: '1',
            content: '새로운 댓글이 달렸습니다.',
            notificationType: 'comment',
            relatedId: 123,
            isRead: false,
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            content: '게시물에 좋아요를 받았습니다.',
            notificationType: 'like',
            relatedId: 456,
            isRead: false,
            createdAt: '2024-01-02T00:00:00Z'
          }
        ];
        
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue(mockNotifications)
        };
        
        mockFetch.mockResolvedValue(mockResponse);
        
        const result = await fetchNotifications(dispatch);
        
        // fetch 호출 확인
        expect(mockFetch).toHaveBeenCalledWith('/api/notifications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // 로딩 상태 변경 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
        
        // 각 알림이 상태에 추가되었는지 확인
        mockNotifications.forEach(notification => {
          expect(dispatch).toHaveBeenCalledWith({
            type: ActionType.ADD_NOTIFICATION,
            payload: notification
          });
        });
        
        // 결과 확인
        expect(result).toEqual(mockNotifications);
      });
      
      test('알림 목록 가져오기 실패 시 오류를 설정한다', async () => {
        const mockResponse = {
          ok: false,
          status: 500,
          json: jest.fn().mockResolvedValue({
            message: '서버 오류'
          })
        };
        
        mockFetch.mockResolvedValue(mockResponse);
        
        try {
          await fetchNotifications(dispatch);
          fail('알림 목록 가져오기 실패 시 예외가 발생해야 합니다.');
        } catch (error) {
          // 로딩 상태 변경 확인
          expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
          expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
          
          // 오류 설정 확인
          expect(dispatch).toHaveBeenCalledWith({
            type: ActionType.SET_ERROR,
            payload: '알림을 가져오는데 실패했습니다.'
          });
          
          // handleApiError 호출 확인
          expect(handleApiError).toHaveBeenCalled();
        }
      });
    });
    
    describe('markNotificationAsRead', () => {
      const dispatch = jest.fn();
      const notificationId = '1';
      
      test('알림 읽음 표시 성공 시 상태를 업데이트한다', async () => {
        const updatedNotification: Notification = {
          id: notificationId,
          content: '새로운 댓글이 달렸습니다.',
          notificationType: 'comment',
          relatedId: 123,
          isRead: true,
          createdAt: '2024-01-01T00:00:00Z'
        };
        
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue(updatedNotification)
        };
        
        mockFetch.mockResolvedValue(mockResponse);
        
        const result = await markNotificationAsRead(dispatch, notificationId);
        
        // fetch 호출 확인
        expect(mockFetch).toHaveBeenCalledWith(`/api/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // 로딩 상태 변경 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
        
        // 알림 상태 업데이트 확인
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.REMOVE_NOTIFICATION,
          payload: notificationId
        });
        
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.ADD_NOTIFICATION,
          payload: updatedNotification
        });
        
        // 결과 확인
        expect(result).toEqual(updatedNotification);
      });
      
      test('알림 읽음 표시 실패 시 오류를 설정한다', async () => {
        const mockResponse = {
          ok: false,
          status: 404,
          json: jest.fn().mockResolvedValue({
            message: '알림을 찾을 수 없습니다.'
          })
        };
        
        mockFetch.mockResolvedValue(mockResponse);
        
        try {
          await markNotificationAsRead(dispatch, notificationId);
          fail('알림 읽음 표시 실패 시 예외가 발생해야 합니다.');
        } catch (error) {
          // 로딩 상태 변경 확인
          expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
          expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
          
          // 오류 설정 확인
          expect(dispatch).toHaveBeenCalledWith({
            type: ActionType.SET_ERROR,
            payload: '알림을 읽음 표시하는데 실패했습니다.'
          });
          
          // handleApiError 호출 확인
          expect(handleApiError).toHaveBeenCalled();
        }
      });
    });
    
    describe('markAllNotificationsAsRead', () => {
      const dispatch = jest.fn();
      
      test('모든 알림 읽음 표시 성공 시 상태를 업데이트한다', async () => {
        const updatedNotifications: Notification[] = [
          {
            id: '1',
            content: '새로운 댓글이 달렸습니다.',
            notificationType: 'comment',
            relatedId: 123,
            isRead: true,
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            content: '게시물에 좋아요를 받았습니다.',
            notificationType: 'like',
            relatedId: 456,
            isRead: true,
            createdAt: '2024-01-02T00:00:00Z'
          }
        ];
        
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue(updatedNotifications)
        };
        
        mockFetch.mockResolvedValue(mockResponse);
        
        const result = await markAllNotificationsAsRead(dispatch);
        
        // fetch 호출 확인
        expect(mockFetch).toHaveBeenCalledWith('/api/notifications/read-all', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // 로딩 상태 변경 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
        
        // 알림 상태 업데이트 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.CLEAR_NOTIFICATIONS });
        
        updatedNotifications.forEach(notification => {
          expect(dispatch).toHaveBeenCalledWith({
            type: ActionType.ADD_NOTIFICATION,
            payload: notification
          });
        });
        
        // 결과 확인
        expect(result).toEqual(updatedNotifications);
      });
      
      test('모든 알림 읽음 표시 실패 시 오류를 설정한다', async () => {
        const mockResponse = {
          ok: false,
          status: 500,
          json: jest.fn().mockResolvedValue({
            message: '서버 오류'
          })
        };
        
        mockFetch.mockResolvedValue(mockResponse);
        
        try {
          await markAllNotificationsAsRead(dispatch);
          fail('모든 알림 읽음 표시 실패 시 예외가 발생해야 합니다.');
        } catch (error) {
          // 로딩 상태 변경 확인
          expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
          expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
          
          // 오류 설정 확인
          expect(dispatch).toHaveBeenCalledWith({
            type: ActionType.SET_ERROR,
            payload: '모든 알림을 읽음 표시하는데 실패했습니다.'
          });
          
          // handleApiError 호출 확인
          expect(handleApiError).toHaveBeenCalled();
        }
      });
    });
    
    describe('deleteNotification', () => {
      const dispatch = jest.fn();
      const notificationId = '1';
      
      test('알림 삭제 성공 시 상태에서 알림을 제거한다', async () => {
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ success: true })
        };
        
        mockFetch.mockResolvedValue(mockResponse);
        
        const result = await deleteNotification(dispatch, notificationId);
        
        // fetch 호출 확인
        expect(mockFetch).toHaveBeenCalledWith(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // 로딩 상태 변경 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
        
        // 알림 상태 업데이트 확인
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.REMOVE_NOTIFICATION,
          payload: notificationId
        });
        
        // 결과 확인
        expect(result).toBe(true);
      });
      
      test('알림 삭제 실패 시 오류를 설정한다', async () => {
        const mockResponse = {
          ok: false,
          status: 404,
          json: jest.fn().mockResolvedValue({
            message: '알림을 찾을 수 없습니다.'
          })
        };
        
        mockFetch.mockResolvedValue(mockResponse);
        
        try {
          await deleteNotification(dispatch, notificationId);
          fail('알림 삭제 실패 시 예외가 발생해야 합니다.');
        } catch (error) {
          // 로딩 상태 변경 확인
          expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
          expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
          
          // 오류 설정 확인
          expect(dispatch).toHaveBeenCalledWith({
            type: ActionType.SET_ERROR,
            payload: '알림을 삭제하는데 실패했습니다.'
          });
          
          // handleApiError 호출 확인
          expect(handleApiError).toHaveBeenCalled();
        }
      });
    });
  });