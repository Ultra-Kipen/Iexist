import request from 'supertest';
import express = require('express');
import { Application } from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from '../../middleware/corsMiddleware';
import { apiLimiter } from '../../middleware/rateLimitMiddleware';
import { configSecurity } from '../../middleware/securityMiddleware';
import myDayRouter from '../../routes/myDay';
import authMiddleware from '../../middleware/authMiddleware';
import db from '../../models';
import { sequelize } from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Sequelize, QueryTypes } from 'sequelize';

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
 const baseURL = '/api/my-day';
 let authToken: string;
 let testPostId: number;
 let testUser: any;

 const validPostData = {
   content: '테스트 게시물입니다. 이것은 10자 이상의 내용을 포함합니다.',
   emotion_ids: [1],
   is_anonymous: false
 };

 async function createTestPost() {
   const response = await request(app)
     .post(`${baseURL}/posts`)
     .set('Authorization', `Bearer ${authToken}`)
     .send(validPostData);
   return response.body.data?.post_id;
 }

 beforeAll(async () => {
   app = createApp(false);
   await sequelize.authenticate();
   await sequelize.sync({ force: true });
 });

 beforeEach(async () => {
   await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
   await Promise.all([
     'my_day_posts',
     'my_day_likes', 
     'my_day_comments',
     'my_day_emotions',
     'users',
     'emotions'
   ].map(table => sequelize.query(`TRUNCATE TABLE ${table}`)));
   await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

   await sequelize.query(`
     INSERT INTO emotions (emotion_id, name, icon, color)
     VALUES (1, '행복', 'emoticon-happy-outline', '#FFD700')
   `);

   const [userId] = await sequelize.query(`
     INSERT INTO users (email, password_hash, nickname, is_active, created_at, updated_at)
     VALUES ('test@example.com', :password_hash, 'TestUser', true, NOW(), NOW())
   `, {
     replacements: {
       password_hash: await bcrypt.hash('password123', 10)
     },
     type: QueryTypes.INSERT
   });

   testUser = {
     user_id: userId,
     email: 'test@example.com',
     nickname: 'TestUser',
     is_active: true
   };

   authToken = jwt.sign(
     { user_id: testUser.user_id },
     JWT_SECRET,
     { expiresIn: '1h' }
   );

   testPostId = await createTestPost();
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