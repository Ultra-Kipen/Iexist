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
    return await apiClient.get<{ 
      status: string; 
      data: Notification[];
      pagination?: {
        total: number;
        page: number;
        limit: number;
      }
    }>('/notifications', { params });
  },
  
  markAsRead: async (notificationId: number) => {
    return await apiClient.put<{ status: string; message: string }>(
      `/notifications/${notificationId}/read`
    );
  },
  
  markAllAsRead: async () => {
    return await apiClient.put<{ status: string; message: string }>(
      '/notifications/read-all'
    );
  },
  
  getUnreadCount: async () => {
    return await apiClient.get<{ status: string; data: { count: number } }>(
      '/notifications/unread-count'
    );
  },
  
  deleteNotification: async (notificationId: number) => {
    return await apiClient.delete<{ status: string; message: string }>(
      `/notifications/${notificationId}`
    );
  },
  
  updateNotificationSettings: async (settings: { 
    like_notifications?: boolean;
    comment_notifications?: boolean;
    challenge_notifications?: boolean;
    system_notifications?: boolean;
  }) => {
    return await apiClient.put<{ status: string; message: string }>(
      '/users/notification-settings',
      settings
    );
  },
  
  getNotificationSettings: async () => {
    return await apiClient.get<{ 
      status: string; 
      data: {
        like_notifications: boolean;
        comment_notifications: boolean;
        challenge_notifications: boolean;
        system_notifications: boolean;
      } 
    }>('/users/notification-settings');
  }
};

export default notificationService;