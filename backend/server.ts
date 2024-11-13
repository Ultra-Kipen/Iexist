import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorHandler from './middleware/errorMiddleware';
import { corsMiddleware } from './middleware/corsMiddleware';
import userRoutes from './routes/users';
import emotionRoutes from './routes/emotions';
import myDayRoutes from './routes/myDay';
import someoneDayRoutes from './routes/someoneDay';
import { sequelize } from './models';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });
const app = express();

// 미들웨어 설정
app.use(morgan('dev'));
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api/users', userRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/my-day', myDayRoutes);
app.use('/api/someone-day', someoneDayRoutes);

// 에러 핸들링 미들웨어
app.use(errorHandler);

// 데이터베이스 연결 및 서버 시작
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행중입니다`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

export { app, startServer };