// __tests__/functional/userFlow.functional.test.ts
import { mockAuthService } from '../mocks/mockAuthService';
import { mockEmotionService } from '../mocks/mockEmotionService';

// 함수형 사용자 흐름 테스트
describe('User Flow - Functional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('User can login and record emotion', async () => {
    // 로그인 테스트
    const loginCredentials = { email: 'test@example.com', password: 'password123' };
    const loginResponse = await mockAuthService.login(loginCredentials);
    
    expect(mockAuthService.login).toHaveBeenCalledWith(loginCredentials);
    expect(loginResponse.data.success).toBe(true);
    expect(loginResponse.data.data.token).toBeDefined();
    expect(loginResponse.data.data.user).toBeDefined();
    
    // 감정 기록 테스트
    const emotionId = 1;
    const emotionNote = '오늘은 좋은 하루였어요';
    const recordResponse = await mockEmotionService.logEmotion({ 
      emotion_ids: [emotionId], 
      note: emotionNote 
    });
    
    expect(mockEmotionService.logEmotion).toHaveBeenCalledWith({ 
      emotion_ids: [emotionId], 
      note: emotionNote 
    });
    expect(recordResponse.data.success).toBe(true);
  });

  test('User can view emotions and logout', async () => {
    // 감정 목록 가져오기 테스트
    const emotionsResponse = await mockEmotionService.getAllEmotions();
    
    expect(mockEmotionService.getAllEmotions).toHaveBeenCalled();
    expect(emotionsResponse.data).toHaveLength(1);
    expect(emotionsResponse.data[0].name).toBe('행복');
    
    // 로그아웃 테스트
    const logoutResponse = await mockAuthService.logout();
    
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(logoutResponse.data.success).toBe(true);
  });
});