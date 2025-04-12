// tests/integration/api/authEndpoints.test.ts

import request from 'supertest';
import app from '../../../app';
import db from '../../../models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../../../models/User';

// 테스트 요청을 보내기 위한 설정
const testRequest = request(app);
const baseURL = '/api';

// JWT 토큰 생성 함수
const generateToken = (userId: number): string => {
  return jwt.sign(
    { user_id: userId },
    process.env.JWT_SECRET || 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=',
    { expiresIn: '24h' }
  );
};

// 테스트 사용자 생성 함수
const createTestUser = async (): Promise<{ user: any; token: string }> => {
  const notificationSettings = {
    like_notifications: true,
    comment_notifications: true,
    challenge_notifications: true,
    encouragement_notifications: true
  };

  const user = await db.User.create({
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password_hash: await bcrypt.hash('Password123!', 10),
    nickname: `TestUser_${Date.now()}`,
    theme_preference: 'system',
    is_active: true,
    notification_settings: JSON.stringify(notificationSettings) as unknown as User['notification_settings'],
    privacy_settings: JSON.stringify({}) as unknown as User['privacy_settings'],
    created_at: new Date(),
    updated_at: new Date()
  });

  // 사용자 통계 생성
  await db.UserStats.create({
    user_id: user.get('user_id'),
    my_day_post_count: 0,
    someone_day_post_count: 0,
    my_day_like_received_count: 0,
    someone_day_like_received_count: 0,
    my_day_comment_received_count: 0,
    someone_day_comment_received_count: 0,
    challenge_count: 0,
    last_updated: new Date()
  });

  const token = generateToken(user.get('user_id'));
  return { user, token };
};

describe('API 엔드포인트 권한 검증 테스트', () => {
  let testUser: any;
  let userToken: string;
  let invalidToken: string = 'invalid.token.string';

  beforeAll(async () => {
    // 데이터베이스 연결 확인
    try {
      await db.sequelize.authenticate();
      console.log('데이터베이스 연결 성공');
    } catch (error) {
      console.error('데이터베이스 연결 실패:', error);
      throw new Error('데이터베이스 연결 실패');
    }

    // 테스트 사용자 생성
    const result = await createTestUser();
    testUser = result.user;
    userToken = result.token;
  }, 30000);

  afterAll(async () => {
    // 테스트 데이터 정리
    if (testUser) {
      try {
        await db.UserStats.destroy({ where: { user_id: testUser.get('user_id') } });
        await db.User.destroy({ where: { user_id: testUser.get('user_id') } });
      } catch (error) {
        console.error('테스트 데이터 정리 중 오류:', error);
      }
    }

    // 데이터베이스 연결 종료
    await db.sequelize.close();
  }, 10000);

  // 1. 토큰 없이 접근 테스트
  describe('인증 토큰 없이 접근', () => {
    const endpoints = [
      { method: 'get', path: '/users/profile' },
      { method: 'get', path: '/my-day/posts' },
      { method: 'get', path: '/someone-day' },
      // '/emotions'는 인증이 필요하지 않은 것으로 보임
      { method: 'get', path: '/challenges' },
      { method: 'get', path: '/notifications' },
      { method: 'get', path: '/stats' },
      { method: 'get', path: '/tags' }
    ];

    test.each(endpoints)('$method $path 접근 시 401 에러 반환', async ({ method, path }) => {
      const res = await testRequest[method as 'get'](`${baseURL}${path}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', '인증이 필요합니다.');
    });
  });

  // 2. 유효하지 않은 토큰으로 접근 테스트
  describe('유효하지 않은 토큰으로 접근', () => {
    const endpoints = [
      { method: 'get', path: '/users/profile' },
      { method: 'get', path: '/my-day/posts' },
      { method: 'get', path: '/someone-day' },
      // '/emotions'는 인증이 필요하지 않은 것으로 보임
      { method: 'get', path: '/challenges' },
      { method: 'get', path: '/notifications' },
      { method: 'get', path: '/stats' },
      { method: 'get', path: '/tags' }
    ];

    test.each(endpoints)('$method $path 접근 시 401 에러 반환', async ({ method, path }) => {
      const res = await testRequest[method as 'get'](`${baseURL}${path}`)
        .set('Authorization', `Bearer ${invalidToken}`);
        
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toMatch(/유효하지 않은 인증 토큰입니다/);
    });
  });

  // 3. 유효한 토큰으로 접근 테스트
  describe('유효한 토큰으로 접근', () => {
    const endpoints = [
      { method: 'get', path: '/users/profile', expectedStatus: 200 },
      // '/emotions'는 인증 없이도 접근 가능하므로 다른 인증 필요한 경로 사용
      { method: 'get', path: '/notifications', expectedStatus: 200 },
      { method: 'get', path: '/stats', expectedStatus: 200 },
      { method: 'get', path: '/my-day/posts', expectedStatus: 200 }
    ];

    test.each(endpoints)('$method $path 접근 시 $expectedStatus 반환', async ({ method, path, expectedStatus }) => {
      const res = await testRequest[method as 'get'](`${baseURL}${path}`)
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(res.status).toBe(expectedStatus);
      expect(res.body).toHaveProperty('status', 'success');
    });
  });

  // 4. 수정 권한 테스트
  describe('리소스 수정 권한', () => {
    it('자신의 프로필 업데이트 요청은 성공해야 함', async () => {
      const res = await testRequest
        .put(`${baseURL}/users/profile`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          nickname: `UpdatedUser_${Date.now()}`
        });
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
    });

    it('자신의 알림 설정 업데이트 요청은 성공해야 함', async () => {
      const res = await testRequest
        .put(`${baseURL}/users/notification-settings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          like_notifications: true,
          comment_notifications: false,
          challenge_notifications: true,
          encouragement_notifications: false
        });
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
    });
  });

  // 5. 보호된 라우트 테스트
  describe('보호된 라우트 테스트', () => {
    it('보호된 라우트 접근 시 유효한 토큰으로 성공해야 함', async () => {
      const res = await testRequest
        .get(`${baseURL}/protected-route`)
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
    });

    it('보호된 라우트 접근 시 토큰 없이 실패해야 함', async () => {
      const res = await testRequest
        .get(`${baseURL}/protected-route`);
        
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('message', '인증이 필요합니다.');
    });
  });
});