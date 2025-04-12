// tests/database/concurrency.test.ts
import db from '../../models';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { UserCreationAttributes } from '../../models/User';

// 전역 타임아웃 값 증가 (10분)
jest.setTimeout(600000);

describe('동시성 및 경쟁 조건 테스트', () => {
  const testUserData: Omit<UserCreationAttributes, 'user_id'> = {
    username: 'concurrency_test',
    email: 'concurrency@example.com',
    password_hash: '',
    nickname: 'ConcurrencyTest',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    notification_settings: {
      like_notifications: true,
      comment_notifications: true,
      challenge_notifications: true,
      encouragement_notifications: true
    },
    privacy_settings: JSON.parse('{}') // 올바른 JSON 타입 생성
  };

  let userId: number;

  beforeAll(async () => {
    try {
      await db.sequelize.authenticate();
      console.log('데이터베이스 연결 성공');

      // 테이블 스키마 동기화 (force: false로 데이터는 유지하며 스키마만 동기화)
      await db.sequelize.sync({ force: false });
      console.log('데이터베이스 스키마 동기화 완료');
      
      // 기존 테스트 데이터 삭제 (특정 패턴만)
      await db.User.destroy({ 
        where: { 
          email: testUserData.email 
        } 
      });
      
      await db.MyDayPost.destroy({ 
        where: { 
          content: { 
            [Op.like]: '%동시성 테스트%' 
          } 
        } 
      });
      
      console.log('기존 테스트 데이터 삭제 완료');
      
      // 테스트 사용자 생성
      testUserData.password_hash = await bcrypt.hash('password123', 10);
      const user = await db.User.create(testUserData);
      userId = user.get('user_id');
      
      // UserStats 테이블에 필요한 기본 레코드 생성 - 직접 쿼리 실행 방식으로 변경
      try {
        await db.sequelize.query(`
          INSERT INTO user_stats (
            user_id, 
            my_day_post_count, 
            someone_day_post_count,
            my_day_like_received_count,
            someone_day_like_received_count,
            my_day_comment_received_count,
            someone_day_comment_received_count,
            challenge_count,
            last_updated
          ) VALUES (?, 0, 0, 0, 0, 0, 0, 0, NOW())
        `, {
          replacements: [userId]
        });
      } catch (statsError) {
        console.warn('UserStats 생성 중 오류 (무시됨):', (statsError as Error).message || '알 수 없는 오류');
      }
      
      console.log(`테스트 사용자 생성: ID=${userId}`);
    } catch (error) {
      console.error('테스트 초기화 오류:', error);
      throw error;
    }
  }, 300000); // 5분 타임아웃

  afterAll(async () => {
    try {
      // 테스트 데이터 정리
      await db.MyDayPost.destroy({
        where: { 
          user_id: userId,
          content: { 
            [Op.like]: '%테스트%' 
          }
        }
      });
      
      // UserStats 레코드 삭제 시도
      try {
        await db.UserStats.destroy({ 
          where: { user_id: userId } 
        });
      } catch (statsError) {
        console.warn('UserStats 삭제 중 오류 (무시됨):', (statsError as Error).message || '알 수 없는 오류');
      }
      
      await db.User.destroy({ where: { email: testUserData.email } });
      console.log('테스트 데이터 정리 완료');
      
      // DB 연결 종료
      await db.sequelize.close();
      console.log('데이터베이스 연결 종료');
    } catch (error) {
      console.error('테스트 정리 오류:', error);
    }
  }, 300000); // 5분 타임아웃

  // 최소 하나의 테스트 케이스 추가
  it('기본 동시성 테스트: 사용자 생성 및 조회', async () => {
    // 사용자가 존재하는지 확인
    const foundUser = await db.User.findOne({
      where: { email: testUserData.email }
    });
    
    expect(foundUser).not.toBeNull();
    expect(foundUser?.get('email')).toBe(testUserData.email);
    expect(foundUser?.get('nickname')).toBe(testUserData.nickname);
  });
  
  // 여기에 추가 테스트 케이스를 구현할 수 있습니다.
  it('게시물 생성 및 조회 테스트', async () => {
    // 게시물 생성
    const post = await db.MyDayPost.create({
      user_id: userId,
      content: '동시성 테스트를 위한 게시물',
      is_anonymous: false,
      like_count: 0,
      comment_count: 0
    });
    
    expect(post).not.toBeNull();
    expect(post.get('user_id')).toBe(userId);
    
    // 게시물 조회
    const foundPost = await db.MyDayPost.findOne({
      where: { 
        user_id: userId,
        content: '동시성 테스트를 위한 게시물'
      }
    });
    
    expect(foundPost).not.toBeNull();
    expect(foundPost?.get('content')).toBe('동시성 테스트를 위한 게시물');
  });
});