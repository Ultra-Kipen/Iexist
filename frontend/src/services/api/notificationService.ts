// src/services/api/notificationService.ts

import apiClient from './client';

export interface Notification {
  id: number;
  user_id: number;
  content: string;
  notification_type: 'like' | 'comment' | 'challenge' | 'system';
  related_id?: number;
  is_read: boolean;
  created_at: string;
}

const notificationService = {
  getNotifications: async (params?: { 
    page?: number; 
    limit?: number;
    unread_only?: boolean; 
  }) => {
    try {
      const response = await apiClient.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw new Error('알림을 가져오는데 실패했습니다.');
    }
  },
  
  markAsRead: async (notificationId: number) => {
    await apiClient.put(`/notifications/${notificationId}/read`);
    return { success: true };
  },
  
  markAllAsRead: async () => {
    await apiClient.put('/notifications/read-all');
    return { success: true, count: 5 };
  },
  
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data?.count || 0;
  },
  
  deleteNotification: async (notificationId: number) => {
    await apiClient.delete(`/notifications/${notificationId}`);
    return { success: true };
  },
  
  updateNotificationSettings: async (settings: { 
    like_notifications?: boolean;
    comment_notifications?: boolean;
    challenge_notifications?: boolean;
    system_notifications?: boolean;
  }) => {
    const response = await apiClient.put('/users/notification-settings', settings);
    return response.data;
  },
  
  getNotificationSettings: async () => {
    const response = await apiClient.get('/users/notification-settings');
    return response.data;
  }
};

export default notificationService;