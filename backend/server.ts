import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

// Winston 로거 설정
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

const app = express();

// 데이터베이스 연결 설정
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [path.join(__dirname, '/models')],
  logging: (msg) => logger.debug(msg)
});

// 데이터베이스 초기화 함수
const initializeDatabase = async () => {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    const baseModels = [
      'users',
      'emotions',
      'tags'
    ];

    for (const modelName of baseModels) {
      if (sequelize.models[modelName]) {
        await sequelize.models[modelName].sync({ force: true });
        logger.info(`${modelName} 테이블 생성 완료`);
      }
    }

    const intermediateModels = [
      'my_day_posts',
      'someone_day_posts'
    ];

    for (const modelName of intermediateModels) {
      if (sequelize.models[modelName]) {
        await sequelize.models[modelName].sync({ force: true });
        logger.info(`${modelName} 테이블 생성 완료`);
      }
    }

    const dependentModels = [
      'my_day_comments',
      'someone_day_comments',
      'my_day_likes',
      'someone_day_likes',
      'challenges',
      'challenge_participants',
      'challenge_emotions',
      'user_stats',
      'notifications',
      'post_reports',
      'encouragement_messages'
    ];

    for (const modelName of dependentModels) {
      if (sequelize.models[modelName]) {
        await sequelize.models[modelName].sync({ force: true });
        logger.info(`${modelName} 테이블 생성 완료`);
      }
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    logger.info('데이터베이스 초기화 완료');

  } catch (error) {
    logger.error('데이터베이스 초기화 중 오류:', error);
    throw error;
  }
};

// 기본 미들웨어 설정
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // IP당 최대 요청 수
});
app.use(limiter);

// 헬스체크 라우트
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: '서버가 정상적으로 실행 중입니다.' });
});

// 서버 시작
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('데이터베이스 연결 성공');

    await initializeDatabase();
    
    app.listen(PORT, () => {
      logger.info(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (error) {
    logger.error('서버 시작 중 오류 발생:', error);
    process.exit(1);
  }
};

// 에러 핸들링
process.on('unhandledRejection', (error: Error) => {
  logger.error('처리되지 않은 Promise 거부:', error);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('처리되지 않은 예외:', error);
  process.exit(1);
});

startServer();

export { app, sequelize };