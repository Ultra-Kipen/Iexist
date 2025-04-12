// server.ts - 수정된 코드

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Server } from 'http';
import path from 'path';
import { Sequelize } from 'sequelize';
import { corsMiddleware } from './middleware/corsMiddleware';
import errorHandler from './middleware/errorMiddleware';
import authRoutes from './routes/auth';
import challengeRoutes from './routes/challenges';
import comfortWallRoutes from './routes/comfortWall';
import emotionRoutes from './routes/emotions';
import myDayRoutes from './routes/myDay';
import notificationRoutes from './routes/notifications';
import postRoutes from './routes/posts';
import someoneDayRoutes from './routes/someoneDay';
import statsRoutes from './routes/stats';
import tagRoutes from './routes/tags';
import userRoutes from './routes/users';

// 환경변수 초기화
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('현재 NODE_ENV:', process.env.NODE_ENV);

// 환경변수 로드 - 기본 환경변수 파일
dotenv.config();

// 테스트 환경일 때 추가 설정 로드
if (process.env.NODE_ENV === 'test') {
  const testEnvPath = path.resolve(__dirname, '.env.test');
  dotenv.config({ path: testEnvPath });
}

const app = express();

// Morgan 로거는 테스트 환경이 아닐 때만 활성화
if (process.env.NODE_ENV !== 'test') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// 기본 미들웨어 설정
app.use(cors());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 데이터베이스 연결 설정
let sequelize: Sequelize;
if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize('iexist_test', 'Iexist', 'sw309824!@', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 20000
    },
    dialectOptions: {
      connectTimeout: 60000
    }
  });
} else {
  sequelize = new Sequelize('iexist', 'Iexist', 'sw309824!@', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// 데이터베이스 연결 유지를 위한 함수
export const keepDbAlive = async () => {
  try {
    // 연결 유지를 위한 간단한 쿼리 실행
    await sequelize.query('SELECT 1');
    
    // 테스트 환경에서는 디버깅 목적으로만 로그 출력 (필요한 경우만)
    if (process.env.NODE_ENV === 'test' && process.env.DEBUG_LOGS === 'true') {
      console.log('테스트 DB 연결 유지 확인:', new Date().toISOString());
    }
  } catch (error) {
    console.error('데이터베이스 연결 유지 실패:', error);
    
    // 연결이 끊어진 경우 재연결 시도
    try {
      await sequelize.authenticate();
      console.log('데이터베이스 재연결 성공');
    } catch (reconnectError) {
      console.error('데이터베이스 재연결 실패:', reconnectError);
    }
  }
};

// 테스트 환경에서는 데이터베이스 연결 유지를 위한 인터벌 설정
let keepAliveInterval: NodeJS.Timeout | null = null;

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/my-day', myDayRoutes);
app.use('/api/someone-day', someoneDayRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/comfort-wall', comfortWallRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/tags', tagRoutes);

// 기본 경로
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Iexist 서버가 실행 중입니다.'
  });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

// 글로벌 에러 핸들러
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('서버 에러:', err);
  res.status(500).json({
    status: 'error',
    message: '서버 오류가 발생했습니다.'
  });
});

const PORT = process.env.NODE_ENV === 'test' ? 5017 : (parseInt(process.env.PORT || '3000'));

let serverInstance: Server | null = null;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    
    if (process.env.NODE_ENV === 'test') {
      console.log('테스트 데이터베이스 연결 확인 성공');
      
      // 테스트 환경에서만 인터벌 설정
      if (!keepAliveInterval) {
        keepAliveInterval = setInterval(keepDbAlive, 5000);
      }
    } else {
      console.log('데이터베이스 연결 성공');
    }

    return new Promise<Server>((resolve) => {
      serverInstance = app.listen(PORT, () => {
        console.log(`서버가 포트 ${PORT}에서 실행중입니다`);
        resolve(serverInstance as Server);
      });
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    if (error instanceof Error) {
      console.error('상세 에러:', error.message, error.stack);
    }
    throw error;
  }
};

const stopServer = async () => {
  try {
    // 인터벌 정리를 가장 먼저 수행
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
      console.log('keepAlive 인터벌 정리 완료');
    }
    
    // 서버 인스턴스 종료
    if (serverInstance) {
      await new Promise<void>((resolve) => {
        const closeTimeout = setTimeout(() => {
          console.log('서버 종료 타임아웃, 강제 해제');
          resolve();
        }, 5000);
        
        serverInstance!.close((err) => {
          clearTimeout(closeTimeout);
          if (err) {
            console.error('서버 종료 오류:', err);
            resolve();
          } else {
            console.log('서버 인스턴스 정상 종료');
            resolve();
          }
        });
      });
      serverInstance = null;
    }
    
    // 데이터베이스 연결 종료
    try {
      await Promise.race([
        sequelize.close(),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);
      console.log('시퀄라이즈 연결 정상 종료');
    } catch (dbError) {
      console.error('DB 연결 종료 중 오류:', dbError);
    }
    
    console.log('서버와 데이터베이스 연결이 정상적으로 종료되었습니다.');
    
    if (process.env.NODE_ENV === 'test') {
      setTimeout(() => {
        console.log('이벤트 루프 정리 완료');
      }, 100);
    }
    
    return true;
  } catch (error) {
    console.error('서버 종료 중 오류:', error);
    return false;
  }
};

export {
  app, sequelize, serverInstance, startServer,
  stopServer
};
