// backend/scripts/testDb.ts

import sequelize, { testConnection } from '../config/database';

async function testDatabase() {
  try {
    // 데이터베이스 연결 테스트
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('\n=== 데이터베이스 정보 ===');
      console.log(`호스트: ${sequelize.config.host}`);
      console.log(`데이터베이스명: ${sequelize.config.database}`);
      console.log(`사용자: ${sequelize.config.username}`);
      console.log(`방언: ${sequelize.getDialect()}`);
      console.log('=====================\n');
    }

    // 연결 종료
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('데이터베이스 테스트 실패:', error);
    process.exit(1);
  }
}

testDatabase();