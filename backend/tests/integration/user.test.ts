import request from 'supertest';
import app from '../../app';
import { User } from '../../models';

describe('User API', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    nickname: 'Test User'
  };

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toMatchObject({
        username: testUser.username,
        email: testUser.email
      });
    });

    it('should not allow duplicate email', async () => {
      await request(app)
        .post('/api/users/register')
        .send(testUser);

      const response = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/users/register')
        .send(testUser);
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toMatchObject({
        email: testUser.email
      });
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      // 사용자 등록
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(testUser);

      // 로그인 수행
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.data.token;
    });

    it('should get user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        username: testUser.username,
        email: testUser.email
      });
    });

    it('should not get profile without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: '인증이 필요합니다.'
      });
    });
  });
});