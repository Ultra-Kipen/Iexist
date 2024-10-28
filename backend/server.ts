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
      
      // 데이터베이스 동기화
      await sequelize.sync({ 
        alter: true,
        force: false,
        logging: console.log
      });
      
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      logger.info('데이터베이스 스키마 동기화 완료');
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