import { app } from '../../server';
import request from 'supertest';
import { sequelize } from '../../models';

describe('API 테스트', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('기본 API 엔드포인트', () => {
    it('서버가 정상적으로 응답해야 합니다', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(401); // 인증이 필요한 엔드포인트이므로 401 응답
    });
  });
});