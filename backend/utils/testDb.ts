import { sequelize, testConnection } from '../models';

async function testDatabase() {
  try {
    // 데이터베이스 연결 테스트
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('데이터베이스 연결 테스트 실패');
      process.exit(1);
    }

    // 모델 동기화 테스트
    try {
      await sequelize.sync({ force: false });
      console.log('데이터베이스 테이블 동기화 성공');
    } catch (error) {
      console.error('테이블 동기화 실패:', error);
      process.exit(1);
    }

    // 연결 종료
    await sequelize.close();
    console.log('데이터베이스 연결 종료');
    process.exit(0);
  } catch (error) {
    console.error('데이터베이스 테스트 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  testDatabase();
}

export default testDatabase;