import { EmotionService } from '../../services/EmotionService'; // Ensure this path is correct
import db from '../../models';

describe('EmotionService', () => {
  let emotionService: EmotionService;

  beforeEach(() => {
    emotionService = new EmotionService();
  });

  test('createEmotion should create emotion logs', async () => {
    const mockData = {
      emotion_ids: [1, 2],
      note: '테스트'
    };
    const userId = 1;

    const result = await emotionService.createEmotion(mockData, userId);
    
    expect(result.status).toBe('success');
    expect(result.data).toHaveLength(2);
  });
});