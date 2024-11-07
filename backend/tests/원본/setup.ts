import { jest } from '@jest/globals';
import db from '../models';

// 전역 설정
beforeAll(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('테스트 데이터베이스 연결됨');
    
    // 데이터베이스 동기화 (테이블 재생성)
    await db.sequelize.sync({ force: true });
  } catch (error) {
    console.error('테스트 데이터베이스 연결 실패:', error);
    throw error; // 테스트 실행 중단
  }
});

// 각 테스트 전에 테이블 데이터 초기화
beforeEach(async () => {
  try {
    // 모든 테이블의 데이터 삭제
    const models = Object.values(db.sequelize.models);
    
    // 외래 키 제약 조건 비활성화 (SQLite의 경우 필요 없음)
    if (db.sequelize.getDialect() !== 'sqlite') {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    }
    
    // 각 테이블의 데이터 삭제
    for (const model of models) {
      await model.destroy({
        where: {},
        force: true,
        truncate: true
      });
    }
    
    // 외래 키 제약 조건 다시 활성화
    if (db.sequelize.getDialect() !== 'sqlite') {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  } catch (error) {
    console.error('테이블 데이터 초기화 실패:', error);
    throw error;
  }
});

// 모든 테스트 완료 후 데이터베이스 연결 종료
afterAll(async () => {
  try {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('테스트 데이터베이스 연결 종료');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('데이터베이스 연결 종료 실패:', error.message);
    }
  }
});

// Jest 타임아웃 설정
jest.setTimeout(10000);

// 전역 에러 핸들링
process.on('unhandledRejection', (error: Error) => {
  console.error('처리되지 않은 Promise 거부:', error);
});

export { db as testDb };