// __tests__/mocks/mockEmotionService.ts
export const mockEmotionService = {
    getAllEmotions: jest.fn().mockResolvedValue({
      data: [
        { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' }
      ]
    }),
    logEmotion: jest.fn().mockResolvedValue({ data: { success: true } })
  };