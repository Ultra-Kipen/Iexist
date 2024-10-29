import request from 'supertest';
import app from '../../app';

describe('API 테스트', () => {
  describe('기본 API 엔드포인트', () => {
    it('서버가 정상적으로 응답해야 합니다', async () => {
      const response = await request(app)
        .get('/api')
        .expect('Content-Type', /application\/json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'API is running');
    });
  });
});