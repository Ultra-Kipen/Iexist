import request from 'supertest';
import { app } from '../../server';
import { setupTestDB, clearTestDB } from '../helpers';

describe('API 테스트', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await clearTestDB();
  });

  describe('기본 API 엔드포인트', () => {
    it('서버가 정상적으로 응답해야 합니다', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });
});