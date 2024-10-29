import request from 'supertest';
import app from '../../src/app';
import { sequelize } from '../../src/models';

describe('감정 API 테스트', () => {
  beforeEach(async () => {
    // 테스트 데이터 생성
    await sequelize.models.Emotion.bulkCreate([
      { name: '행복', icon: '😊' },
      { name: '슬픔', icon: '😢' }
    ]);
  });

  describe('GET /api/emotions', () => {
    it('모든 감정을 조회해야 합니다', async () => {
      const response = await request(app)
        .get('/api/emotions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/emotions', () => {
    it('새로운 감정을 생성해야 합니다', async () => {
      const newEmotion = { name: '기쁨', icon: '😄' };
      
      const response = await request(app)
        .post('/api/emotions')
        .send(newEmotion);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('name', newEmotion.name);
      expect(response.body.data).toHaveProperty('icon', newEmotion.icon);
    });

    it('중복된 감정 이름으로 생성을 시도하면 실패해야 합니다', async () => {
      const duplicateEmotion = { name: '행복', icon: '😊' };

      const response = await request(app)
        .post('/api/emotions')
        .send(duplicateEmotion);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});