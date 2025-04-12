// __tests__/mocks/services/emotionService.mock.ts
import { mockEmotions, mockEmotionLogs, mockEmotionStats } from '../data/emotionData.mock';

export const mockEmotionService = {
  getAllEmotions: jest.fn().mockResolvedValue({ data: mockEmotions }),
  
  getUserEmotions: jest.fn().mockResolvedValue({ 
    data: mockEmotionLogs 
  }),
  
  logEmotion: jest.fn().mockImplementation((userId, emotionData) => {
    return Promise.resolve({
      data: {
        log_id: Math.floor(Math.random() * 1000) + 10,
        user_id: userId,
        ...emotionData,
        created_at: new Date().toISOString()
      }
    });
  }),
  
  getEmotionStats: jest.fn().mockImplementation((userId, period = 'weekly') => {
    return Promise.resolve({
      data: period === 'weekly' ? mockEmotionStats.weekly : mockEmotionStats.monthly
    });
  }),
  
  deleteEmotionLog: jest.fn().mockResolvedValue({ data: { success: true } }),
  
  updateEmotionLog: jest.fn().mockImplementation((logId, updateData) => {
    return Promise.resolve({
      data: {
        log_id: logId,
        ...updateData,
        updated_at: new Date().toISOString()
      }
    });
  })
};

export default mockEmotionService;