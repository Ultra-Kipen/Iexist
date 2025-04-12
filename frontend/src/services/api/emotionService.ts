
// src/services/api/emotionService.ts

import apiClient from './client';

export interface Emotion {
  emotion_id: number;
  name: string;
  icon: string;
  color: string;
}

export interface EmotionCreateDTO {
  emotion_ids: number[];
  note?: string;
}

const emotionService = {
  getAllEmotions: async () => {
    return await apiClient.get<{ status: string; data: Emotion[] }>('/emotions');
  },
  
  recordEmotions: async (data: EmotionCreateDTO) => {
    return await apiClient.post('/emotions', data);
  },
  
  getEmotionStats: async (params?: { start_date?: string; end_date?: string }) => {
    return await apiClient.get('/emotions/stats', { params });
  },
  
  getEmotionTrends: async (params?: { 
    start_date?: string; 
    end_date?: string; 
    type?: 'day' | 'week' | 'month' | 'monthly' 
  }) => {
    return await apiClient.get('/stats/trends', { params });
  },
  
  getDailyEmotionCheck: async () => {
    return await apiClient.get('/emotions/daily-check');
  }
};

export default emotionService;