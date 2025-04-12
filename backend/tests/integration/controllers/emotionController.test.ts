import request from 'supertest';
import { createTestUser, db } from '../../setup';
import { app } from '../../../server';

const BASE_URL = '/api/emotions';

describe('Emotion Controller', () => {
  let token: string;
  let testUser: any;

  beforeAll(async () => {
    const result = await createTestUser();
    token = result.token;
    testUser = result.user;

    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.Emotion.destroy({ truncate: true, force: true });
    await db.EmotionLog.destroy({ truncate: true, force: true }); 
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    await db.Emotion.create({
      emotion_id: 1,
      name: '행복',
      icon: 'emoticon-happy-outline',
      color: '#FFD700'
    });
  });

  describe('GET /stats', () => {
    beforeEach(async () => {
      const transaction = await db.sequelize.transaction();
      try {
        // User 데이터는 유지하고 EmotionLog만 초기화
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
        await db.EmotionLog.destroy({ truncate: true, force: true, transaction });
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });

        // User가 존재하는지 확인
        const existingUser = await db.User.findByPk(testUser.user_id, { transaction });
        
        if (existingUser) {
          await db.EmotionLog.create({
            user_id: testUser.user_id,
            emotion_id: 1,
            note: '테스트 로그',
            log_date: new Date()
          }, { transaction });
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        console.error('테스트 데이터 생성 오류:', error);
      }
    });

    it('감정 통계를 조회해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });

    it('인증 없이 접근하면 오류를 반환해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('인증이 필요합니다.');
    });
  });

  describe('GET /trends', () => {
    beforeEach(async () => {
      const transaction = await db.sequelize.transaction();
      try {
        // 기존 데이터 삭제
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
        await db.EmotionLog.destroy({ truncate: true, force: true, transaction });
        await db.User.destroy({ truncate: true, force: true, transaction });
        await db.Emotion.destroy({ truncate: true, force: true, transaction });
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
     
        // testUser 먼저 생성
        const user = await db.User.create({
          username: testUser.username,
          email: testUser.email,
          password_hash: testUser.password_hash, 
          nickname: testUser.nickname,
          is_active: testUser.is_active,
          notification_settings: testUser.notification_settings,
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction });
     
        // emotion 데이터 생성
        const emotion = await db.Emotion.create({
          emotion_id: 1,
          name: '행복',
          icon: 'emoticon-happy-outline',
          color: '#FFD700'
        }, { transaction });
     
        // EmotionLog 생성 
        await db.EmotionLog.create({
          user_id: user.get('user_id'),
          emotion_id: emotion.get('emotion_id'),
          note: '테스트 로그',
          log_date: new Date()
        }, { transaction });
     
        const result = await createTestUser();
        token = result.token;
        
      } catch (error) {
        await transaction.rollback();
        console.error('테스트 데이터 생성 오류:', error);
      }
    });
   
    it('감정 트렌드를 조회해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/trends`)
        .set('Authorization', `Bearer ${token}`)  // 토큰 확인
        .set('Content-Type', 'application/json');
   
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.trends).toBeDefined();
    });
   
    it('인증 없이 접근하면 오류를 반환해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/trends`);
   
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('인증이 필요합니다.');
    });
   });

  afterAll(async () => {
    try {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await db.EmotionLog.destroy({ truncate: true, force: true });
      await db.Emotion.destroy({ truncate: true, force: true });
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.error('데이터 정리 중 오류:', error);
    }
  });
});