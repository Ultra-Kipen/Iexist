import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';
import dotenv from 'dotenv';
import db, { sequelize } from './models';

dotenv.config();

const app = express();

// 로거 설정
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

// CORS 설정
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API 라우트
import routes from './routes';
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('데이터베이스 연결 성공');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

      // 동기화할 모델들을 그룹화하고 순서 지정
      const modelGroups = [
        // 1. 독립적인 기본 테이블
        ['User', 'Tag', 'Emotion'],
        
        // 2. 한 개의 외래키를 가진 테이블
        ['EmotionLog', 'MyDayPost', 'SomeoneDayPost', 'Challenge'],
        
        // 3. 두 개 이상의 외래키를 가진 테이블
        ['MyDayComment', 'SomeoneDayComment', 'MyDayEmotion'],
        
        // 4. 다대다 관계 테이블
        ['ChallengeParticipant', 'PostTag']
      ];

      // 그룹별로 순차적 동기화
      for (const group of modelGroups) {
        await Promise.all(
          group.map(async (modelName) => {
            if (db[modelName]) {
              try {
                await db[modelName].sync({
                  alter: true,
                  force: false
                });
                logger.info(`${modelName} 모델 동기화 완료`);
              } catch (error) {
                logger.error(`${modelName} 모델 동기화 실패:`, error);
                throw error;
              }
            }
          })
        );
      }

      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      logger.info('모든 데이터베이스 스키마 동기화 완료');
    }

    app.listen(PORT, () => {
      logger.info(`서버가 포트 ${PORT}에서 실행 중입니다.`);
      logger.info(`환경: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

// 에러 핸들링
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('에러 발생:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || '서버 내부 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

// 서버 시작
startServer();

export default app;