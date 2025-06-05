import notificationService from '../../../../src/services/api/notificationService';
import apiClient from '../../../../src/services/api/client';

// API 클라이언트 목
jest.mock('../../../../src/services/api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('알림 목록을 올바르게 가져와야 함', async () => {
      const mockNotifications = [
        {
          id: 1,
          content: '게시물에 좋아요를 받았습니다.',
          notification_type: 'like',
          is_read: false,
          created_at: '2025-04-17T12:00:00Z',
        },
        {
          id: 2,
          content: '새로운 댓글이 달렸습니다.',
          notification_type: 'comment',
          is_read: true,
          created_at: '2025-04-16T10:30:00Z',
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockNotifications });

      const result = await notificationService.getNotifications();

      // params 인자를 포함하여 호출 확인
      expect(apiClient.get).toHaveBeenCalledWith('/notifications', { params: undefined });
      expect(result).toEqual(mockNotifications);
    });

    it('오류 발생 시 적절하게 처리해야 함', async () => {
      const error = new Error('Network Error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(notificationService.getNotifications()).rejects.toThrow('알림을 가져오는데 실패했습니다.');
    });
  });

  describe('markAsRead', () => {
    it('알림을 읽음 상태로 표시해야 함', async () => {
      const notificationId = 1;
      (apiClient.put as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const result = await notificationService.markAsRead(notificationId);

      expect(apiClient.put).toHaveBeenCalledWith(`/notifications/${notificationId}/read`);
      expect(result).toEqual({ success: true });
    });
  });

  describe('markAllAsRead', () => {
    it('모든 알림을 읽음 상태로 표시해야 함', async () => {
      (apiClient.put as jest.Mock).mockResolvedValue({
        data: { success: true, count: 5 },
      });

      const result = await notificationService.markAllAsRead();

      expect(apiClient.put).toHaveBeenCalledWith('/notifications/read-all');
      expect(result).toEqual({ success: true, count: 5 });
    });
  });

  describe('deleteNotification', () => {
    it('알림을 성공적으로 삭제해야 함', async () => {
      const notificationId = 1;
      (apiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const result = await notificationService.deleteNotification(notificationId);

      expect(apiClient.delete).toHaveBeenCalledWith(`/notifications/${notificationId}`);
      expect(result).toEqual({ success: true });
    });
  });

  describe('getUnreadCount', () => {
    it('읽지 않은 알림 개수를 올바르게 가져와야 함', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { count: 3 },
      });

      const result = await notificationService.getUnreadCount();

      expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toBe(3);
    });
  });
});