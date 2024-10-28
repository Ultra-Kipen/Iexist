import request from 'supertest';
import { app } from '../../server';
import { sequelize } from '../../models';
import { generateToken } from '../../utils/auth';

describe('감정 API 테스트', () => {
  let token: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // 테스트용 사용자 생성 및 토큰 발급
    token = generateToken(1);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/emotions', () => {
    it('새로운 감정을 생성해야 합니다', async () => {
      const response = await request(app)
        .post('/api/emotions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '행복',
          icon: '😊'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', '행복');
    });
  });

  describe('GET /api/emotions', () => {
    it('모든 감정을 조회해야 합니다', async () => {
      const response = await request(app)
        .get('/api/emotions')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
});