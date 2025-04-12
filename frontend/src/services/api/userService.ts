// src/services/api/userService.ts

import apiClient from './client';

export interface ProfileUpdateData {
  nickname?: string;
  profile_image_url?: string;
  background_image_url?: string;
  favorite_quote?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  privacy_settings?: {
    show_profile?: boolean;
    show_emotions?: boolean;
    show_posts?: boolean;
    show_challenges?: boolean;
  };
}

export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  nickname?: string;
  profile_image_url?: string;
  background_image_url?: string;
  favorite_quote?: string;
  theme_preference: 'light' | 'dark' | 'system';
  privacy_settings: {
    show_profile: boolean;
    show_emotions: boolean;
    show_posts: boolean;
    show_challenges: boolean;
  };
  last_login_at: string;
  created_at: string;
}

export interface UserStats {
  my_day_post_count: number;
  someone_day_post_count: number;
  my_day_like_received_count: number;
  someone_day_like_received_count: number;
  my_day_comment_received_count: number;
  someone_day_comment_received_count: number;
  challenge_count: number;
  last_updated: string;
}

const userService = {
  getProfile: async () => {
    return await apiClient.get<{ status: string; data: UserProfile }>('/users/profile');
  },
  
  updateProfile: async (data: ProfileUpdateData) => {
    return await apiClient.put<{ status: string; message: string }>('/users/profile', data);
  },
  
  getUserById: async (userId: number) => {
    return await apiClient.get<{ status: string; data: UserProfile }>(`/users/${userId}`);
  },
  
  getUserStats: async () => {
    return await apiClient.get<{ status: string; data: UserStats }>('/users/stats');
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    return await apiClient.put<{ status: string; message: string }>('/users/password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  },
  
  blockUser: async (userId: number) => {
    return await apiClient.post<{ status: string; message: string }>(`/users/block/${userId}`);
  },
  
  unblockUser: async (userId: number) => {
    return await apiClient.delete<{ status: string; message: string }>(`/users/block/${userId}`);
  },
  
  getBlockedUsers: async () => {
    return await apiClient.get<{ status: string; data: UserProfile[] }>('/users/blocked');
  }
};

export default userService;