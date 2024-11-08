// userController.test.ts
import { testRequest, baseURL } from '../../setup';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../../../config/database';

const JWT_SECRET = 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA='; // Replace with your actual secret key

// userController.test.ts

describe('User Controller', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const response = await testRequest
        .post(`${baseURL}/users/register`)
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
          nickname: 'NewUser'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', 'new@example.com');
    });

    it('should return error for duplicate email', async () => {
      await sequelize.models.users.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const response = await testRequest
        .post(`${baseURL}/users/register`)
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('이미 사용 중인 이메일입니다.');
    });

    it('should return error for missing fields', async () => {
      const response = await testRequest
        .post(`${baseURL}/users/register`)
        .send({
          username: 'newuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('필수 필드가 누락되었습니다.');
    });
  });

  describe('POST /users/login', () => {
    beforeEach(async () => {
      await sequelize.models.users.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });
    });

    it('should login successfully', async () => {
      const response = await testRequest
        .post(`${baseURL}/users/login`)
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return error for wrong password', async () => {
      const response = await testRequest
        .post(`${baseURL}/users/login`)
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    });

    it('should return error for non-existent email', async () => {
      const response = await testRequest
        .post(`${baseURL}/users/login`)
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    });
  });

  describe('PUT /users/profile', () => {
    let token: string;

    beforeEach(async () => {
      const user = await sequelize.models.users.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const response = await testRequest
        .post(`${baseURL}/users/login`)
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      token = response.body.data.token;
    });

    it('should update user profile', async () => {
      const response = await testRequest
        .put(`${baseURL}/users/profile`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          nickname: 'UpdatedUser',
          theme_preference: 'dark'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('nickname', 'UpdatedUser');
      expect(response.body.data).toHaveProperty('theme_preference', 'dark');
    });

    it('should return error for unauthorized access', async () => {
      const response = await testRequest
        .put(`${baseURL}/users/profile`)
        .send({
          nickname: 'UpdatedUser',
          theme_preference: 'dark'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('인증이 필요합니다.');
    });

    it('should return error for invalid user ID', async () => {
      const invalidToken = jwt.sign({ id: 9999 }, JWT_SECRET, { expiresIn: '24h' });

      const response = await testRequest
        .put(`${baseURL}/users/profile`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          nickname: 'UpdatedUser',
          theme_preference: 'dark'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('사용자를 찾을 수 없습니다.');
    });
  });

  describe('GET /users/profile', () => {
    let token: string;

    beforeEach(async () => {
      const user = await sequelize.models.users.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const response = await testRequest
        .post(`${baseURL}/users/login`)
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      token = response.body.data.token;
    });

    it('should get user profile', async () => {
      const response = await testRequest
        .get(`${baseURL}/users/profile`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('username', 'testuser');
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('should return error for unauthorized access', async () => {
      const response = await testRequest
        .get(`${baseURL}/users/profile`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('인증이 필요합니다.');
    });
  });
});