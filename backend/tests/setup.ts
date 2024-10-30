import { jest } from '@jest/globals';
import db from '../models';

// 전역 설정
beforeAll(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Test database connected');
    
    // 데이터베이스 동기화
    await db.sequelize.sync({ force: true });
  } catch (error) {
    console.error('Unable to connect to the test database:', error);
  }
});

afterAll(async () => {
  await db.sequelize.close();
});

// 각 테스트 전에 테이블 초기화
beforeEach(async () => {
  await db.sequelize.truncate({ cascade: true });
});

// Jest 타임아웃 설정
jest.setTimeout(10000);

// 전역 에러 핸들링
process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled Promise Rejection:', error);
});

export { db as testDb };