import request from 'supertest';
import { Application } from 'express';
import { sequelize } from '../setup';  // setup.ts의 sequelize만 사용
import cookieParser from 'cookie-parser';
import express from 'express';
import { corsMiddleware } from '../../middleware/corsMiddleware';
import { apiLimiter } from '../../middleware/rateLimitMiddleware';
import { configSecurity } from '../../middleware/securityMiddleware';
import myDayRouter from '../../routes/myDay';
import authMiddleware from '../../middleware/authMiddleware';
import { QueryTypes } from 'sequelize';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';

const createApp = (useRateLimit: boolean = true) => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(corsMiddleware);
  configSecurity(app);
  
  if (useRateLimit) {
    app.use(apiLimiter);
  }

  app.use('/api/my-day', authMiddleware, myDayRouter);
  return app;
};

describe('Post API Tests', () => {
  let app: Application;
  let authToken: string;
  let testUserId: number;
  let testPostId: number;  // 여기로 이동
  const baseURL = '/api/my-day';  // baseURL 추가

  const validPostData = {
    content: '테스트 게시물입니다. 이것은 10자 이상의 내용을 포함합니다.',
    emotion_ids: [1],
    is_anonymous: false
  };


  async function createTestPost(userId: number) {  // userId 매개변수 추가
    const [postId] = await sequelize.query(`
      INSERT INTO my_day_posts (user_id, content, is_anonymous, character_count, like_count, comment_count, created_at, updated_at)
      VALUES (:userId, :content, false, :characterCount, 0, 0, NOW(), NOW())
    `, {
      replacements: {
        userId,
        content: validPostData.content,
        characterCount: validPostData.content.length
      },
      type: QueryTypes.INSERT
    });

  // emotion 연결
  await sequelize.query(`
    INSERT INTO my_day_emotions (post_id, emotion_id)
    VALUES (:postId, :emotionId)
  `, {
    replacements: {
      postId,
      emotionId: validPostData.emotion_ids[0]
    }
  });

  return postId;
}

beforeAll(async () => {
  app = createApp(false);
});

beforeEach(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  
  // 테이블 초기화 순서 변경
  await Promise.all([
    'my_day_likes',
    'my_day_comments', 
    'my_day_emotions',
    'my_day_posts',
    'user_stats',
    'emotions',
    'users'
  ].map(table => sequelize.query(`TRUNCATE TABLE ${table}`)));
  
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

      // emotions 데이터 추가
      await sequelize.query(`
        INSERT INTO emotions (emotion_id, name, icon, color)
        VALUES (1, '행복', 'emoticon-happy-outline', '#FFD700')
      `);
  
      // 테스트 유저 생성
      const [userId] = await sequelize.query(`
        INSERT INTO users (username, email, password_hash, nickname, is_active, created_at, updated_at)
        VALUES ('testuser', 'test@example.com', 'hashedpassword', 'TestUser', true, NOW(), NOW())
      `, { type: QueryTypes.INSERT });
    
      testUserId = userId;


   // user_stats 생성
   await sequelize.query(`
    INSERT INTO user_stats (user_id, my_day_post_count) 
    VALUES (:userId, 0)
  `, {
    replacements: { userId: testUserId }
  });

  // JWT 토큰 생성
  authToken = jwt.sign({ user_id: testUserId }, JWT_SECRET, { expiresIn: '1h' });

  // 테스트 포스트 생성
  testPostId = await createTestPost(testUserId);
});
 afterAll(async () => {
   await sequelize.close();
 });

 describe('POST /posts', () => {
   it('should create a new post successfully', async () => {
     const response = await request(app)
       .post(`${baseURL}/posts`)
       .set('Authorization', `Bearer ${authToken}`)
       .send(validPostData);

     expect(response.status).toBe(201);
     expect(response.body).toMatchObject({
       status: 'success',
       data: expect.objectContaining({
         post_id: expect.any(Number)
       })
     });
   });

   it('should fail without auth token', async () => {
     const response = await request(app)
       .post(`${baseURL}/posts`)
       .send(validPostData);

     expect(response.status).toBe(401);
     expect(response.body).toMatchObject({
       status: 'error',
       message: '인증이 필요합니다.'
     });
   });

   it('should fail with invalid content', async () => {
     const response = await request(app)
       .post(`${baseURL}/posts`)
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         content: 'short',
         emotion_ids: [1]
       });

     expect(response.status).toBe(400);
     expect(response.body).toEqual({
       success: false,
       errors: [{
         field: 'content',
         message: '내용은 10자 이상 1000자 이하여야 합니다.'
       }]
     });
   });
 });

 describe('GET /posts', () => {
   it('should get post list successfully', async () => {
     const response = await request(app)
       .get(`${baseURL}/posts`)
       .set('Authorization', `Bearer ${authToken}`);

     expect(response.status).toBe(200);
     expect(response.body.data).toMatchObject({
       posts: expect.arrayContaining([
         expect.objectContaining({
           post_id: expect.any(Number),
           content: expect.any(String)
         })
       ])
     });
     expect(response.body.data.posts.length).toBeGreaterThan(0);
   });

   it('should get posts with pagination', async () => {
     const response = await request(app)
       .get(`${baseURL}/posts`)
       .set('Authorization', `Bearer ${authToken}`)
       .query({ page: 1, limit: 10 });

     expect(response.status).toBe(200);
     expect(response.body.data.pagination).toMatchObject({
       current_page: 1,
       total_pages: expect.any(Number),
       total_count: expect.any(Number)
     });
   });
 });

 describe('POST /:id/like', () => {
   it('should like post successfully', async () => {
     const response = await request(app)
       .post(`${baseURL}/${testPostId}/like`)
       .set('Authorization', `Bearer ${authToken}`);

     expect(response.status).toBe(200);
     expect(response.body).toMatchObject({
       status: 'success',
       message: '게시물에 좋아요를 표시했습니다.'
     });
   });

   it('should unlike post when liked again', async () => {
     await request(app)
       .post(`${baseURL}/${testPostId}/like`)
       .set('Authorization', `Bearer ${authToken}`);

     const response = await request(app)
       .post(`${baseURL}/${testPostId}/like`)
       .set('Authorization', `Bearer ${authToken}`);

     expect(response.status).toBe(200);
     expect(response.body).toMatchObject({
       status: 'success',
       message: '게시물 좋아요를 취소했습니다.'
     });
   });

   it('should fail with invalid post id', async () => {
     const invalidPostId = 999999;
     const response = await request(app)
       .post(`${baseURL}/${invalidPostId}/like`)
       .set('Authorization', `Bearer ${authToken}`);

     expect(response.status).toBe(404);
     expect(response.body).toMatchObject({
       status: 'error',
       message: '게시물을 찾을 수 없습니다.'
     });
   });
 });
});