// tests/resilience/dbResilience.test.ts
import { Sequelize } from 'sequelize';
import { startServer, stopServer } from '../../server';

// DB 연결 재생성 함수
async function createNewConnection() {
  // 새로운 Sequelize 인스턴스 생성
  const newConnection = new Sequelize('iexist_test', 'Iexist', 'sw309824!@', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  
  // 연결 확인
  await newConnection.authenticate();
  return newConnection;
}

describe('데이터베이스 복원력 테스트', () => {
  // 테스트용 별도 DB 연결
  let testConnection: Sequelize;
  
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    
    // 서버 시작 (기존 연결 사용)
    await startServer();
    
    // 별도 연결 생성
    testConnection = await createNewConnection();
    console.log('테스트 데이터베이스 연결 성공');
  }, 30000);

  afterAll(async () => {
    // 테스트용 연결 종료
    if (testConnection) {
      await testConnection.close();
      console.log('테스트 데이터베이스 연결 종료');
    }
    
    // 메인 서버 중지
    await stopServer();
  }, 30000);

  test('데이터베이스 연결 생성 및 연결 상태 확인', async () => {
    // 독립적인 새 연결 생성
    const connection = await createNewConnection();
    
    try {
      // 연결 상태 확인 (인증)
      await connection.authenticate();
      expect(true).toBe(true); // 연결이 성공했으면 테스트 통과
    } finally {
      // 테스트 후 연결 종료
      await connection.close();
    }
  }, 10000);

  test('트랜잭션 기본 동작 확인', async () => {
    // 독립적인 새 연결 생성
    const connection = await createNewConnection();
    
    try {
      // 트랜잭션 시작
      const transaction = await connection.transaction();
      
      // 트랜잭션 커밋
      await transaction.commit();
      
      // 트랜잭션이 커밋되었으므로 성공
      expect(true).toBe(true);
    } finally {
      // 테스트 후 연결 종료
      await connection.close();
    }
  }, 10000);

  test('다중 연결 생성 및 닫기 테스트', async () => {
    // 여러 연결 생성
    const connection1 = await createNewConnection();
    const connection2 = await createNewConnection();
    
    try {
      // 각 연결이 정상 작동하는지 확인
      await connection1.authenticate();
      await connection2.authenticate();
      
      // 모두 성공했다면 테스트 통과
      expect(true).toBe(true);
    } finally {
      // 모든 연결 종료
      await connection1.close();
      await connection2.close();
    }
  }, 10000);

  test('연결 닫기 후 재연결 테스트', async () => {
    // 첫 번째 연결 생성
    let connection = await createNewConnection();
    
    try {
      // 연결 상태 확인
      await connection.authenticate();
      
      // 연결 닫기
      await connection.close();
      
      // 새 연결 생성
      connection = await createNewConnection();
      
      // 새 연결 상태 확인
      await connection.authenticate();
      
      // 재연결 성공
      expect(true).toBe(true);
    } finally {
      // 연결이 있다면 종료
      if (connection) {
        try {
          await connection.close();
        } catch (e) {
          // 이미 닫혔다면 무시
        }
      }
    }
  }, 10000);

  test('Raw 쿼리 실행 테스트', async () => {
    // 새 연결 생성
    const connection = await createNewConnection();
    
    try {
      // 간단한 원시 쿼리 실행
      const [results] = await connection.query('SELECT 1+1 as result');
      
      // 결과 확인
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    } finally {
      // 연결 종료
      await connection.close();
    }
  }, 10000);
});