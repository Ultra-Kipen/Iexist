import supertest from 'supertest';
import { Application } from 'express';
import express from 'express';
import { corsMiddleware } from '../../middleware/corsMiddleware';
import { configSecurity } from '../../middleware/securityMiddleware';
import myDayRouter from '../../routes/myDay';
import authMiddleware from '../../middleware/authMiddleware';
import { QueryTypes } from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../../models';

const JWT_SECRET = process.env.JWT_SECRET || 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(corsMiddleware);
  configSecurity(app);
  
  // 라우트 경로 수정
  app.use('/api', authMiddleware);
  app.use('/api/my-day', myDayRouter);

  // 에러 핸들링 미들웨어 추가
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Test Error Handler:', err);
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || '서버 오류가 발생했습니다.'
    });
  });

  return app;
};

describe('Post API Tests', () => {
  let app: Application;
  let authToken: string;
  let testUserId: number;
  let testPostId: number;

  const validPostData = {
    content: '테스트 게시물입니다. 이것은 10자 이상의 내용을 포함합니다.',
    emotion_ids: [1], // 존재하는 emotion_id만 사용
    is_anonymous: false,
    emotion_summary: '테스트 감정 요약',
    character_count: 0 // 명시적으로 character_count 추가
  };

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    
    // 이미 존재할 경우 삭제 후 재생성하도록 변경
    try {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS=0;');
      await db.sequelize.query('TRUNCATE TABLE emotions;');
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS=1;');
      
      // 기본 감정 데이터 생성
      await db.Emotion.bulkCreate([
        { 
          emotion_id: 1, 
          name: '행복', 
          icon: 'emoticon-happy-outline', 
          color: '#FFD700',
          created_at: new Date(),
          updated_at: new Date()
        },
      {
        emotion_id: 2,
        name: '감사',
        icon: 'hand-heart',
        color: '#FF69B4', 
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { 
      ignoreDuplicates: true
    });
    console.log('테스트용 감정 데이터 초기화 완료');
  } catch (error) {
    console.error('테스트용 감정 데이터 초기화 오류:', error);
  }
});

  beforeEach(async () => {
    app = createApp();
  
    // 사용자 생성
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const currentDate = new Date();

    const user = await db.User.create({
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password_hash: hashedPassword,
      nickname: 'TestUser',
      is_active: true,
      theme_preference: 'system',
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      },
      created_at: currentDate,
      updated_at: currentDate
    });

    testUserId = user.user_id;

    // 사용자 통계 생성
    await db.UserStats.create({
      user_id: testUserId,
      my_day_post_count: 0,
      someone_day_post_count: 0,
      my_day_like_received_count: 0,
      someone_day_like_received_count: 0,
      my_day_comment_received_count: 0,
      someone_day_comment_received_count: 0,
      challenge_count: 0,
      last_updated: currentDate
    });

    // 인증 토큰 생성
    authToken = jwt.sign(
      { user_id: testUserId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 테스트용 게시물 생성
    const post = await db.MyDayPost.create({
      user_id: testUserId,
      content: '테스트 게시물',
      is_anonymous: false,
      character_count: 13,
      like_count: 0,
      comment_count: 0,
      created_at: currentDate,
      updated_at: currentDate
    });

    testPostId = post.post_id;
  });

  afterEach(async () => {
    // 관계된 테이블 삭제 순서 변경
    await db.MyDayEmotion.destroy({ where: {} });
    await db.MyDayLike.destroy({ where: {} });
    await db.MyDayComment.destroy({ where: {} });
    await db.MyDayPost.destroy({ where: {} });
    await db.UserStats.destroy({ where: {} });
    await db.User.destroy({ where: {} });
  });
  describe('POST /posts', () => {
    it('should fail if content is missing', async () => {
      const response = await supertest(app)
        .post('/api/my-day/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emotion_ids: [1],
          is_anonymous: false
        });
  
      console.log('Content Missing Response:', response.status, response.body);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error'); 
    });
    it('should succeed even if emotion_ids is missing', async () => {
      const response = await supertest(app)
        .post('/api/my-day/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '테스트 게시물입니다. 이것은 10자 이상의 내용을 포함합니다.',
          is_anonymous: false
        });
    
      console.log('Emotion IDs Missing Response:', response.status, response.body);
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    });
 
    it('should succeed even if character_count is missing', async () => {
      // 감정 생성 코드 제거 (이미 beforeAll에서 생성됨)
      
      // 테스트 요청
      const response = await supertest(app)
        .post('/api/my-day/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '테스트 게시물입니다. 이것은 10자 이상의 내용을 포함합니다.',
          emotion_ids: [1],
          is_anonymous: false,
          emotion_summary: '테스트 감정'
        });
         
      // 응답 검증  
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('post_id');
    });
 
     describe('Like Post', () => {
      it('should like post successfully', async () => {
        const response = await supertest(app)
          .post(`/api/my-day/${testPostId}/like`)
          .set('Authorization', `Bearer ${authToken}`);
    
        console.log('Like Post Response:', response.status, response.body);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          status: 'success',
          message: '게시물에 좋아요를 표시했습니다.'
        });
      });
    
      it('should unlike post when liked again', async () => {
        await supertest(app)
          .post(`/api/my-day/${testPostId}/like`)
          .set('Authorization', `Bearer ${authToken}`);
    
        const response = await supertest(app)
          .post(`/api/my-day/${testPostId}/like`)
          .set('Authorization', `Bearer ${authToken}`);
    
        console.log('Unlike Post Response:', response.status, response.body);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          status: 'success',
          message: '게시물 좋아요를 취소했습니다.'
        });
      });
    
      it('should fail with invalid post id', async () => {
        const invalidPostId = 999999;
        const response = await supertest(app)
          .post(`/api/my-day/${invalidPostId}/like`)
          .set('Authorization', `Bearer ${authToken}`);
    
        console.log('Invalid Post ID Response:', response.status, response.body);
        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
      });
    });
  });
 });