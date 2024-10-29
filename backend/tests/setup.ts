import { sequelize } from '../models';
import app from '../app';

let server: any;

beforeAll(async () => {
  try {
    // 테스트 환경 설정
    process.env.NODE_ENV = 'test';
    
    // 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('테스트 데이터베이스 연결 성공');
    
    // 테스트용 테이블 생성 (force: true로 테이블 재생성)
    await sequelize.sync({ force: true });
    console.log('테스트 테이블 생성 완료');
    
    // 테스트 서버 시작
    const PORT = process.env.TEST_PORT || 3001;
    server = app.listen(PORT);
    console.log(`테스트 서버가 포트 ${PORT}에서 실행 중입니다.`);
  } catch (error) {
    console.error('테스트 설정 실패:', error);
    throw error;
  }
});

beforeEach(async () => {
  try {
    // 각 테스트 전에 모든 테이블 데이터 초기화
    for (const model of Object.values(sequelize.models)) {
      await model.destroy({
        where: {},
        truncate: true,
        cascade: true,
        restartIdentity: true,
        force: true
      });
    }
    console.log('테이블 데이터 초기화 완료');
  } catch (error) {
    console.error('테이블 초기화 실패:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // 서버 종료
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
      console.log('테스트 서버 종료');
    }
    
    // 데이터베이스 연결 종료
    await sequelize.close();
    console.log('테스트 데이터베이스 연결 종료');
  } catch (error) {
    console.error('테스트 정리 실패:', error);
    throw error;
  }
});