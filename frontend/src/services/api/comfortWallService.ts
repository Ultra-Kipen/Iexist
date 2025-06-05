// src/services/api/comfortWallService.ts

import apiClient from './client';

export interface ComfortWallPostData {
  title: string;
  content: string;
  is_anonymous?: boolean;
  tag_ids?: number[];
}

export interface ComfortMessageData {
  message: string;
  is_anonymous?: boolean;
}

const comfortWallService = {
  createPost: async (data: ComfortWallPostData) => {
    return await apiClient.post('/comfort-wall', data);
  },
  
  getPosts: async (params?: { 
    page?: number; 
    limit?: number; 
    sort_by?: 'latest' | 'popular';
    tag?: string;
  }) => {
    return await apiClient.get('/comfort-wall', { params });
  },
  
  getBestPosts: async (params?: { period?: 'daily' | 'weekly' | 'monthly' }) => {
    return await apiClient.get('/comfort-wall/best', { params });
  },
  
  sendMessage: async (postId: number, data: ComfortMessageData) => {
    return await apiClient.post(`/comfort-wall/${postId}/message`, data);
  },
  
  // 좋아요 기능 추가
  likePost: async (postId: number) => {
    return await apiClient.post(`/comfort-wall/${postId}/like`);
  }
};

export default comfortWallService;