// 환경 변수 구성 및 타입 정의
interface AppEnvironment {
    API_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
    VERSION: string;
    API_TIMEOUT: number;
    DEFAULT_LANGUAGE: string;
    DEFAULT_TIMEZONE: string;
    DEFAULT_PAGE_SIZE: number;
    MAX_PAGE_SIZE: number;
  }
  
  // 백엔드의 .env 파일을 참고하여 프론트엔드 환경 변수 설정
  const env: AppEnvironment = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    VERSION: process.env.REACT_APP_VERSION || '1.0.0',
    API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10),
    DEFAULT_LANGUAGE: process.env.REACT_APP_DEFAULT_LANGUAGE || 'ko',
    DEFAULT_TIMEZONE: process.env.REACT_APP_DEFAULT_TIMEZONE || 'Asia/Seoul',
    DEFAULT_PAGE_SIZE: parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE || '10', 10),
    MAX_PAGE_SIZE: parseInt(process.env.REACT_APP_MAX_PAGE_SIZE || '100', 10),
  };
  
  export default env;