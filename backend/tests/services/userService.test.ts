import request from 'supertest';
import app from '../../app';
import db from '../../models';
import bcrypt from 'bcryptjs';

// Jest 타임아웃 전역 설정
jest.setTimeout(30000);

describe('User Service', () => {
  beforeAll(async () => {
    // 데이터베이스 초기화를 setup.ts에서 수행하므로 여기서는 불필요
  }, 60000);

  beforeEach(async () => {
    // 특정 테이블 초기화 - 트랜잭션과 오류 처리 추가
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      
      // 외래키 제약 비활성화
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
      
      // 테이블 초기화
      await db.User.destroy({ 
        truncate: true, 
        cascade: true, 
        transaction 
      });
      
      await db.UserStats.destroy({ 
        truncate: true, 
        cascade: true, 
        transaction 
      });
      
      // 외래키 제약 다시 활성화
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
      
      // 트랜잭션 커밋
      await transaction.commit();
    } catch (error) {
      // 오류 발생시 롤백
      if (transaction) await transaction.rollback();
      console.error('Database cleanup error:', error);
      throw error; // 테스트 실패 처리
    }
  }, 30000);

  describe('createUser', () => {
    it('should create a new user with proper data', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'password123!', // 특수문자 추가
        nickname: 'TestUser1'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      // 디버깅을 위한 로그 추가
      if (response.status !== 201) {
        console.error('Registration Response:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toMatchObject({
        username: userData.username,
        email: userData.email
      });

      // user_stats 생성 확인
      const userStats = await db.UserStats.findOne({
        where: { user_id: response.body.data.user.user_id }
      });
      expect(userStats).toBeDefined();
    }, 30000);
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      await db.User.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: await bcrypt.hash('password123!', 10), 
        nickname: 'TestUser',
        is_active: true,
        notification_settings: {
          like_notifications: true,
          comment_notifications: true, 
          challenge_notifications: true,
          encouragement_notifications: true
        },
        created_at: new Date(),
        updated_at: new Date()
      });
    }, 30000);

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
    }, 30000);
  });

  afterEach(async () => {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
      await db.sequelize.query('TRUNCATE TABLE challenge_emotions', { transaction });
      await db.sequelize.query('TRUNCATE TABLE user_stats', { transaction });
      await db.sequelize.query('TRUNCATE TABLE users', { transaction });
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
      
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('After each cleanup error:', error);
      // 테스트 이후 정리 실패는 오류로 처리하지 않음
    }
  }, 30000);
});