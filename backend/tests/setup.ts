import dotenv from 'dotenv';
import { sequelize } from '../models';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('Test database connected');

    // 외래키 체크 비활성화
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // 테이블 삭제 순서 정의 (의존성 역순)
    const tableOrder = [
      'post_tags',
      'challenge_participants',
      'challenge_emotions',
      'my_day_emotions',
      'my_day_likes',
      'my_day_comments',
      'someone_day_likes',
      'someone_day_comments',
      'emotion_logs',
      'my_day_posts',
      'someone_day_posts',
      'challenges',
      'emotions',
      'tags',
      'users'
    ];

    // 테이블 순서대로 제거
    for (const tableName of tableOrder) {
      await sequelize.query(`DROP TABLE IF EXISTS ${tableName}`);
    }

    // 테이블 재생성
    await sequelize.sync({ force: true });

    // 외래키 체크 활성화
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('테스트 데이터베이스 초기화 실패:', error);
    throw error;
  }
});

// 각 테스트 후 데이터 초기화
afterEach(async () => {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 모든 테이블의 데이터만 삭제
    for (const model of Object.values(sequelize.models)) {
      await model.destroy({ 
        where: {},
        force: true,
        truncate: true
      });
    }
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('테스트 데이터 초기화 실패:', error);
  }
});

// 모든 테스트 완료 후
afterAll(async () => {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 테스트 완료 후 테이블 초기화 (옵션)
    for (const model of Object.values(sequelize.models)) {
      await model.destroy({ 
        where: {},
        force: true,
        truncate: true
      });
    }
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    await sequelize.close();
  } catch (error) {
    console.error('테스트 데이터베이스 정리 실패:', error);
  }
});

// Jest 타임아웃 설정
jest.setTimeout(30000);