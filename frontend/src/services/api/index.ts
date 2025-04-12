// services/api/index.ts
import apiClient from './client';
import { LoginCredentials, RegisterData } from './types';

export const authService = {
  login: (credentials: LoginCredentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  register: (data: RegisterData) => {
    return apiClient.post('/auth/register', data);
  },
  getProfile: () => {
    return apiClient.get('/users/profile');
  },
  logout: () => {
    return apiClient.post('/auth/logout');
  }
};

// 다른 서비스들 export
export { default as postService } from './postService';
export { default as emotionService } from './emotionService';
export { default as challengeService } from './challengeService';
export { default as comfortWallService } from './comfortWallService';
export { default as tagService } from './tagService';