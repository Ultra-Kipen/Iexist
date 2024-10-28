import request from 'supertest';
import { app } from '../../server';  // 경로 수정
import db from '../../models';       // 경로 수정
import bcrypt from 'bcryptjs';

describe('User API', () => {
  beforeAll(async () => {
    // 테스트 DB 연결 확인
    await db.sequelize.authenticate();
  });

  afterAll(async () => {
    // 테스트 완료 후 연결 종료
    await db.sequelize.close();
  });

  beforeEach(async () => {
    // 테스트 전 테이블 초기화
    await db.sequelize.sync({ force: true });
  });

  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    nickname: 'Test User'
  };

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(testUser)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', testUser.username);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await db.User.create({
        ...testUser,
        password_hash: hashedPassword
      });
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
    });
  });
});