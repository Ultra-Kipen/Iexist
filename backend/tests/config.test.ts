import dotenv from 'dotenv';
import path from 'path';

// 환경변수 로드를 확인하기 위해 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const envPath = process.env.NODE_ENV === 'test' 
  ? path.resolve(__dirname, '../.env.test')
  : path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

describe('환경 설정 테스트', () => {
  test('필수 환경 변수가 정의되어 있는지 확인', () => {
    // JWT 설정 확인
    expect(process.env.JWT_SECRET).toBeDefined();
    
    // 데이터베이스 기본 설정 확인
    expect(process.env.DB_HOST).toBeDefined();
    expect(process.env.DB_USER).toBeDefined();
    expect(process.env.DB_NAME || process.env.NODE_ENV === 'test').toBeTruthy();
  });

  test('JWT_SECRET이 비어있지 않은지 확인', () => {
    const jwtSecret = process.env.JWT_SECRET || '';
    expect(jwtSecret.length).toBeGreaterThan(0);
  });

  test('NODE_ENV가 올바른 값을 가지고 있는지 확인', () => {
    const validEnvs = ['development', 'production', 'test'];
    expect(validEnvs).toContain(process.env.NODE_ENV);
  });
  
  test('포트 번호가 숫자로 변환 가능한지 확인', () => {
    const port = parseInt(process.env.PORT || '3000', 10);
    expect(typeof port).toBe('number');
    expect(isNaN(port)).toBe(false);
  });
});