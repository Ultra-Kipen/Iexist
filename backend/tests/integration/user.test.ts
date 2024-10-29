import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/models';

describe('User API', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    nickname: 'Test User'
  };

  describe('POST /api/users/register', () => {
    it('새로운 사용자를 등록해야 합니다', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('nickname', testUser.nickname);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('중복된 이메일로 등록을 시도하면 실패해야 합니다', async () => {
      await User.create(testUser);

      const response = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await User.create(testUser);
    });

    it('올바른 인증 정보로 로그인해야 합니다', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('잘못된 비밀번호로 로그인을 시도하면 실패해야 합니다', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});