// tests/integration/auth.test.ts

import request from 'supertest';
import app from '../../app';
import db from '../../models';

// 테스트 요청을 보내기 위한 설정
const testRequest = request(app);
const baseURL = '/api';

// 데이터베이스 초기화 함수
const clearDatabase = async () => {
  const tables = [
    'my_day_posts',
    'my_day_likes',
    'my_day_comments',
    'my_day_emotions',
    'users',
    'emotions'  // emotions 테이블 추가
  ];

  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    await db.sequelize.query(`TRUNCATE TABLE ${table}`);
  }
  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
};

describe('Auth API Tests', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    nickname: 'TestUser'
  };

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /users/register', () => {
    it('should register a new user successfully', async () => {
      const response = await testRequest
        .post(`${baseURL}/users/register`)
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        status: 'success',
        message: '회원가입이 완료되었습니다.'
      });
    });

    it('should fail with duplicate email', async () => {
      // 첫 번째 회원가입
      await testRequest
        .post(`${baseURL}/users/register`)
        .send(testUser);
      
      // 중복 이메일로 회원가입 시도
      const response = await testRequest
        .post(`${baseURL}/users/register`)
        .send(testUser);
      
      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        status: 'error',
        message: '이미 존재하는 이메일입니다.'
      });
    });
  });

  describe('POST /users/login', () => {
    beforeEach(async () => {
      // 테스트용 사용자 생성
      await testRequest
        .post(`${baseURL}/users/register`)
        .send(testUser);
    });

    it('should login successfully and return token', async () => {
      const response = await testRequest
        .post(`${baseURL}/users/login`)
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const response = await testRequest
        .post(`${baseURL}/users/login`)
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        status: 'error',
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    });
  });
});