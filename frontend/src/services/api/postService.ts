// src/services/api/postService.ts

import apiClient from './client';

export interface PostCreateData {
  content: string;
  emotion_summary?: string;
  image_url?: string;
  is_anonymous?: boolean;
  emotion_ids?: number[];
}

export interface PostCommentData {
  content: string;
  is_anonymous?: boolean;
}

const postService = {
  createPost: async (data: PostCreateData) => {
    return await apiClient.post('/posts', data);
  },
  
  getPosts: async (params?: { 
    page?: number; 
    limit?: number; 
    emotion?: string; 
    start_date?: string; 
    end_date?: string; 
    sort_by?: 'latest' | 'popular' 
  }) => {
    return await apiClient.get('/posts', { params });
  },
  
  getPostById: async (postId: number) => {
    return await apiClient.get(`/posts/${postId}`);
  },
  
  getMyPosts: async (params?: { 
    page?: number; 
    limit?: number; 
    sort_by?: 'latest' | 'popular' 
  }) => {
    return await apiClient.get('/posts/me', { params });
  },
  
  deletePost: async (postId: number) => {
    return await apiClient.delete(`/posts/${postId}`);
  },
  
  likePost: async (postId: number) => {
    return await apiClient.post(`/posts/${postId}/like`);
  },
  
  addComment: async (postId: number, data: PostCommentData) => {
    return await apiClient.post(`/posts/${postId}/comments`, data);
  },
  
  getComments: async (postId: number) => {
    return await apiClient.get(`/posts/${postId}/comments`);
  }
};

export default postService;