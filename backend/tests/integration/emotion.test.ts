import request from 'supertest';
import { app } from '../../server';
import { setupTestDB, clearTestDB } from '../helpers';
import db from '../../models';

describe('감정 API 테스트', () => {
  beforeAll(async () => {
    await setupTestDB();
    // 기본 감정 데이터 생성
    await db.Emotion.bulkCreate([
      { name: '행복', icon: '😊' },
      { name: '슬픔', icon: '😢' }
    ]);
  });

  afterAll(async () => {
    await clearTestDB();
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
});