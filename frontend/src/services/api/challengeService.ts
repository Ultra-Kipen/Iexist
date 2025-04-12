// src/services/api/challengeService.ts

import apiClient from './client';

export interface ChallengeCreateData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_public?: boolean;
  max_participants?: number;
}

export interface ChallengeProgressData {
  emotion_id: number;
  progress_note?: string;
}

const challengeService = {
  createChallenge: async (data: ChallengeCreateData) => {
    return await apiClient.post('/challenges', data);
  },
  
  getChallenges: async (params?: { 
    page?: number; 
    limit?: number; 
    status?: 'active' | 'completed' | 'upcoming';
    sort_by?: 'start_date' | 'participant_count' | 'created_at';
    order?: 'asc' | 'desc';
  }) => {
    return await apiClient.get('/challenges', { params });
  },
  
  getChallengeDetails: async (challengeId: number) => {
    return await apiClient.get(`/challenges/${challengeId}`);
  },
  
  participateInChallenge: async (challengeId: number) => {
    return await apiClient.post(`/challenges/${challengeId}/participate`);
  },
  
  leaveChallenge: async (challengeId: number) => {
    return await apiClient.delete(`/challenges/${challengeId}/participate`);
  },
  
  updateChallengeProgress: async (challengeId: number, data: ChallengeProgressData) => {
    return await apiClient.post(`/challenges/${challengeId}/progress`, data);
  }
};

export default challengeService;