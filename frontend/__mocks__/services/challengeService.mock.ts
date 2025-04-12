// __tests__/mocks/services/challengeService.mock.ts
import { mockChallenges, mockChallengeEmotions, mockParticipants } from '../data/challengeData.mock';

interface Challenge {
  challenge_id: number;
  creator_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  max_participants: number | null;
  participant_count: number;
  created_at: string;
  [key: string]: any;
}

interface ChallengeEmotion {
  challenge_emotion_id: number;
  challenge_id: number;
  user_id: number;
  emotion_id: number;
  log_date: string;
  note: string | null;
  created_at: string;
  [key: string]: any;
}

interface ApiResponse {
  data: any;
}

export const mockChallengeService = {
  getAllChallenges: jest.fn().mockResolvedValue({ 
    data: mockChallenges 
  }),
  
  getChallengeById: jest.fn().mockImplementation((challengeId: number) => {
    const challenge = mockChallenges.find(c => c.challenge_id === challengeId);
    return Promise.resolve({ data: challenge });
  }),
  
  createChallenge: jest.fn().mockImplementation((challengeData: Partial<Challenge>) => {
    return Promise.resolve({
      data: {
        challenge_id: Math.floor(Math.random() * 1000) + 100,
        creator_id: 1,
        title: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        is_public: true,
        max_participants: null,
        participant_count: 0,
        created_at: new Date().toISOString(),
        ...challengeData
      }
    });
  }),
  
  updateChallenge: jest.fn().mockImplementation((challengeId: number, updateData: Partial<Challenge>) => {
    return Promise.resolve({
      data: {
        challenge_id: challengeId,
        creator_id: 1,
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        is_public: true,
        max_participants: null,
        participant_count: 0,
        created_at: '',
        updated_at: new Date().toISOString(),
        ...updateData
      }
    });
  }),
  
  deleteChallenge: jest.fn().mockResolvedValue({ 
    data: { success: true } 
  }),
  
  joinChallenge: jest.fn().mockResolvedValue({ 
    data: { success: true } 
  }),
  
  leaveChallenge: jest.fn().mockResolvedValue({ 
    data: { success: true } 
  }),
  
  getChallengeParticipants: jest.fn().mockResolvedValue({ 
    data: mockParticipants 
  }),
  
  getChallengeEmotions: jest.fn().mockImplementation((challengeId: number, userId?: number) => {
    const emotions = mockChallengeEmotions.filter(e => 
      e.challenge_id === challengeId && 
      (userId ? e.user_id === userId : true)
    );
    return Promise.resolve({ data: emotions });
  }),
  
  logChallengeEmotion: jest.fn().mockImplementation((challengeId: number, userId: number, emotionData: Partial<ChallengeEmotion>) => {
    return Promise.resolve({
      data: {
        challenge_emotion_id: Math.floor(Math.random() * 1000) + 10,
        challenge_id: challengeId,
        user_id: userId,
        emotion_id: 0,
        log_date: new Date().toISOString().split('T')[0],
        note: null,
        created_at: new Date().toISOString(),
        ...emotionData
      }
    });
  }),
  
  getUserChallenges: jest.fn().mockResolvedValue({ 
    data: mockChallenges.slice(0, 1) 
  })
};

export default mockChallengeService;