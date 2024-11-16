import request from 'supertest';
import app from '../../app';
import db from '../../models';
import { Sequelize } from 'sequelize';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';

const JWT_SECRET = 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';

// 사용자 타입 정의 추가
interface TestUser {
  user_id: number;
  username: string;
  email: string;
  nickname: string;
  is_active: boolean;
}

describe('Post API Tests', () => {
  let authToken: string;
  let user: TestUser;

  beforeAll(async () => {
    try {
      // 테스트 데이터베이스 설정
      await db.sequelize.query(`
        INSERT OR REPLACE INTO users (
          username, 
          email, 
          nickname, 
          password_hash, 
          is_active, 
          created_at, 
          updated_at
        ) VALUES (
          'testuser', 
          'test@example.com', 
          '$2a$10$abcdefghijklmnopqrstuv',
          '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxx',
          1,
          datetime('now'),
          datetime('now')
        );
      `);

      // 사용자 조회 및 타입 지정
      const [foundUser] = await db.sequelize.query<TestUser>(
        `SELECT * FROM users WHERE username = 'testuser' LIMIT 1`,
        { type: QueryTypes.SELECT }
      );

      if (!foundUser) {
        throw new Error('Test user not found');
      }

      user = foundUser;

      // 토큰 생성
      authToken = jwt.sign(
        { 
          user_id: user.user_id,
          username: user.username,
          email: user.email
        }, 
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Test User:', user);
      console.log('Auth Token:', authToken);
    } catch (error) {
      console.error('Test setup error:', error);
      throw error;
    }
  });

  describe('게시물 작성 테스트', () => {
    it('게시물이 성공적으로 작성되어야 함', async () => {
      const postData = {
        content: '테스트 게시물 내용입니다.',
        emotion_summary: '오늘의 감정 요약',
        emotion_ids: [1, 2],
        is_anonymous: false
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      console.log('Response:', response.body);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('post_id');
    });
  });

  afterAll(async () => {
    await db.sequelize.query(`DELETE FROM users WHERE username = 'testuser'`);
  });
});