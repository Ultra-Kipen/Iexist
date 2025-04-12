import { db } from '../../tests/setup';

describe('Database Connection Tests', () => {
  it('should connect to database successfully', async () => {
    try {
      const connected = await db.testConnection();
      expect(connected).toBe(true);
    } catch (error) {
      console.error('데이터베이스 연결 테스트 실패:', error);
      throw error;
    }
  });

  it('should have all required models initialized', () => {
    // 필수 모델이 초기화되었는지 확인
    expect(db.User).toBeDefined();
    expect(db.Emotion).toBeDefined();
    expect(db.MyDayPost).toBeDefined();
    expect(db.SomeoneDayPost).toBeDefined();
    expect(db.Challenge).toBeDefined();
    expect(db.EmotionLog).toBeDefined();
    expect(db.Tag).toBeDefined();
  });
});