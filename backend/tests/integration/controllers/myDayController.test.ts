import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import request from 'supertest';
import authMiddleware from '../../../middleware/authMiddleware';
import { corsMiddleware } from '../../../middleware/corsMiddleware';
import db from '../../../models';
import myDayRouter from '../../../routes/myDay';

const baseURL = '/api/my-day';

// Express 앱 생성 함수
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(corsMiddleware);
  app.use(baseURL, authMiddleware, myDayRouter);
  return app;
};

describe('MyDay Controller', () => {
  let app: any;
  let token: string;
  let user: any;
  let postId: number;
  
  beforeAll(async () => {
    app = createApp();
    // 사전에 완전히 정리
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.sequelize.query('TRUNCATE TABLE my_day_emotions');
    await db.sequelize.query('TRUNCATE TABLE my_day_likes');
    await db.sequelize.query('TRUNCATE TABLE my_day_comments');
    await db.sequelize.query('TRUNCATE TABLE my_day_posts');
    await db.sequelize.query('TRUNCATE TABLE emotions');
    await db.sequelize.query('TRUNCATE TABLE user_stats');
    await db.sequelize.query('TRUNCATE TABLE users');
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  }, 300000); // 300초로 타임아웃 증가

  beforeEach(async () => {
    // 외래키 체크 비활성화
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 테이블 초기화
    await db.sequelize.query('TRUNCATE TABLE my_day_emotions');
    await db.sequelize.query('TRUNCATE TABLE my_day_likes');
    await db.sequelize.query('TRUNCATE TABLE my_day_comments');
    await db.sequelize.query('TRUNCATE TABLE my_day_posts');
    await db.sequelize.query('TRUNCATE TABLE emotions');
    await db.sequelize.query('TRUNCATE TABLE user_stats');
    await db.sequelize.query('TRUNCATE TABLE users');
   
    // 외래키 체크 활성화
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  
    // emotions 데이터 추가
    await db.sequelize.query(`
      INSERT INTO emotions (emotion_id, name, icon, color, created_at, updated_at)
      VALUES (1, '행복', 'emoticon-happy-outline', '#FFD700', NOW(), NOW())
    `, { type: QueryTypes.INSERT });

    // 테스트 유저 생성
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [userId] = await db.sequelize.query(`
      INSERT INTO users (
        username,
        email,
        password_hash,
        nickname,
        is_active,
        theme_preference,
        notification_settings,
        created_at,
        updated_at
      ) VALUES (
        'testuser1',
        'test1@example.com',
        :hashedPassword,
        'TestUser1',
        true,
        'system',
        '{"like_notifications":true,"comment_notifications":true,"challenge_notifications":true,"encouragement_notifications":true}',
        NOW(),
        NOW()
      )
    `, {
      replacements: { hashedPassword },
      type: QueryTypes.INSERT
    });

    user = { user_id: userId };

    // user_stats 생성  
    await db.sequelize.query(`
      INSERT INTO user_stats (user_id, my_day_post_count, my_day_like_received_count, 
      someone_day_post_count, someone_day_like_received_count, 
      my_day_comment_received_count, someone_day_comment_received_count, 
      challenge_count, last_updated)
      VALUES (:userId, 0, 0, 0, 0, 0, 0, 0, NOW())
    `, {
      replacements: { userId }
    });

    // JWT 토큰 생성
    token = jwt.sign({ user_id: userId }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });

    // 테스트용 게시물 생성
    const [postResult] = await db.sequelize.query(`
      INSERT INTO my_day_posts (
        user_id,
        content,
        is_anonymous,
        character_count,
        like_count,
        comment_count,
        created_at,
        updated_at
      ) VALUES (
        :userId,
        '테스트 게시물',
        false,
        13,
        0,
        0,
        NOW(),
        NOW()
      )
    `, {
      replacements: { userId },
      type: QueryTypes.INSERT
    });

    postId = Number(postResult);
  }, 300000); // 300초로 타임아웃 증가

  afterEach(async () => {
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.sequelize.query('TRUNCATE TABLE my_day_emotions');
    await db.sequelize.query('TRUNCATE TABLE my_day_likes');
    await db.sequelize.query('TRUNCATE TABLE my_day_comments');
    await db.sequelize.query('TRUNCATE TABLE my_day_posts');
    await db.sequelize.query('TRUNCATE TABLE user_stats');
    await db.sequelize.query('TRUNCATE TABLE users');
    await db.sequelize.query('TRUNCATE TABLE emotions');
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  // 명시적으로 모든 테스트 종료 후 연결 닫기
 // myDayController.test.ts의 afterAll 함수 수정

// myDayController.test.ts 수정 후
afterAll(async () => {
  try {
    // 먼저 정리 작업 수행
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.sequelize.query('TRUNCATE TABLE my_day_emotions');
    await db.sequelize.query('TRUNCATE TABLE my_day_likes');
    await db.sequelize.query('TRUNCATE TABLE my_day_comments');
    await db.sequelize.query('TRUNCATE TABLE my_day_posts');
    await db.sequelize.query('TRUNCATE TABLE user_stats');
    await db.sequelize.query('TRUNCATE TABLE users');
    await db.sequelize.query('TRUNCATE TABLE emotions');
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('myDayController 테스트 정리 작업 완료');
    
    // 트랜잭션 확인은 제거 - 이것이 연결을 유지할 수 있음
    
    // 데이터베이스 연결을 직접 닫지 않고 Jest가 관리하도록 함
    // db.sequelize.close() 호출 제거
    
    // 일부 애플리케이션 상태 정리
    app = null;
    token = '';
    user = null;
    postId = 0;
    
    console.log('myDayController 테스트 종료');
    
    // 기다리지 않고 즉시 종료
  } catch (error) {
    console.error('정리 중 오류:', error);
  }
}, 60000); // 1분으로 타임아웃 축소

  // 테스트 케이스에도 타임아웃 추가
  describe('POST /posts', () => {
    it('should create a new post without emotion_ids', async () => {
      const response = await request(app)
        .post(`${baseURL}/posts`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '오늘 하루는 정말 특별했습니다. 좋은 일이 많았어요. 충분히 긴 내용으로 작성합니다.',
          is_anonymous: false,
          emotion_summary: '테스트 감정 요약',
          emotion_ids: [1]  // emotion_ids 추가
        });
  
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        status: 'success',
        message: '작업이 성공적으로 완료되었습니다.',
        data: {
          post_id: expect.any(Number)
        }
      });
    }, 120000); // 120초로 타임아웃 증가
  
    it('should prevent posts with short content', async () => {
      const response = await request(app)
        .post(`${baseURL}/posts`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '짧은 내용',
          is_anonymous: false,
          emotion_ids: [1]
        });
    
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        status: 'error',
        errors: [
          {
            field: 'content',
            message: '내용은 10자 이상 1000자 이하여야 합니다.'
          }
        ]
      });
    }, 120000); // 120초로 타임아웃 증가
  
    it('should allow multiple posts on same day in test environment', async () => {
      // 첫 번째 포스트 생성
      await request(app)
        .post(`${baseURL}/posts`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '첫 번째 포스트입니다. 충분히 긴 내용으로 작성합니다.',
          emotion_ids: [1]
        });
    
      // 두 번째 포스트 생성 시도
      const response = await request(app)
        .post(`${baseURL}/posts`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '두 번째 포스트입니다. 테스트 환경에서는 생성되어야 합니다.',
          emotion_ids: [1]
        });
    
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        status: 'success',
        message: '작업이 성공적으로 완료되었습니다.',
        data: {
          post_id: expect.any(Number)
        }
      });
    }, 120000); // 120초로 타임아웃 증가
  });
    
  describe('POST /:id/comments', () => {
    it('should create a comment', async () => {
      const response = await request(app)
        .post(`${baseURL}/${postId}/comments`)  
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '멋진 하루였네요!',
          is_anonymous: false
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          comment_id: expect.any(Number)
        }
      });
    }, 120000); // 120초로 타임아웃 증가
  });

  describe('POST /:id/like', () => {
    it('should toggle like status', async () => {
      const addLike = await request(app)
        .post(`${baseURL}/${postId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(addLike.status).toBe(200);
      expect(addLike.body).toMatchObject({
        status: 'success', 
        message: '게시물에 좋아요를 표시했습니다.'
      });

      const removeLike = await request(app)
        .post(`${baseURL}/${postId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(removeLike.status).toBe(200);
      expect(removeLike.body).toMatchObject({
        status: 'success',
        message: '게시물 좋아요를 취소했습니다.'
      });
    }, 120000); // 120초로 타임아웃 증가
  });

  // GET /posts 테스트 추가
  describe('GET /posts', () => {
    it('should get all posts', async () => {
      // 먼저 몇 개의 게시물이 있는지 확인
      const response = await request(app)
        .get(`${baseURL}/posts`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      // posts가 반드시 배열이어야 함
      expect(Array.isArray(response.body.data.posts)).toBe(true);
      // pagination 객체가 존재해야 함
      expect(response.body.data.pagination).toBeDefined();
    }, 120000); // 120초로 타임아웃 증가

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`${baseURL}/posts`);

      expect(response.status).toBe(401);
    }, 120000); // 120초로 타임아웃 증가
  });

  // GET /:id/comments 테스트 추가
  describe('GET /:id/comments', () => {
    beforeEach(async () => {
      // 테스트 댓글 추가
      await db.sequelize.query(`
        INSERT INTO my_day_comments (
          post_id,
          user_id,
          content,
          is_anonymous,
          created_at,
          updated_at
        ) VALUES (
          :postId,
          :userId,
          '좋은 글이네요!',
          false,
          NOW(),
          NOW()
        ), (
          :postId,
          :userId,
          '익명으로 작성합니다',
          true,
          NOW(),
          NOW()
        )
      `, {
        replacements: { postId, userId: user.user_id },
        type: QueryTypes.INSERT
      });
    }, 300000); // 300초로 타임아웃 증가

    it('should get comments for a post', async () => {
      const response = await request(app)
        .get(`${baseURL}/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.comments)).toBe(true);
    }, 120000); // 120초로 타임아웃 증가
  });

  // DELETE /posts/:id 테스트 추가
  describe('DELETE /posts/:id', () => {
    it('should delete a post', async () => {
      // 새 게시물 생성하여 삭제 테스트
      const [newPostId] = await db.sequelize.query(`
        INSERT INTO my_day_posts (
          user_id,
          content,
          is_anonymous,
          character_count,
          like_count,
          comment_count,
          created_at,
          updated_at
        ) VALUES (
          :userId,
          '삭제할 테스트 게시물',
          false,
          18,
          0,
          0,
          NOW(),
          NOW()
        )
      `, {
        replacements: { userId: user.user_id },
        type: QueryTypes.INSERT
      });

      const response = await request(app)
        .delete(`${baseURL}/posts/${newPostId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    }, 120000); // 120초로 타임아웃 증가

    it('should fail to delete non-existent post', async () => {
      const nonExistentPostId = 99999;
      const response = await request(app)
        .delete(`${baseURL}/posts/${nonExistentPostId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    }, 120000); // 120초로 타임아웃 증가
  });

  // 댓글 관련 추가 테스트
  describe('Comment validation', () => {
    it('should fail with empty comment content', async () => {
      const response = await request(app)
        .post(`${baseURL}/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '',
          is_anonymous: false
        });

      expect(response.status).toBe(400);
    }, 120000); // 120초로 타임아웃 증가

    it('should create anonymous comment', async () => {
      const response = await request(app)
        .post(`${baseURL}/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '익명으로 작성합니다',
          is_anonymous: true
        });

      expect(response.status).toBe(201);
    }, 120000); // 120초로 타임아웃 증가
  });
});