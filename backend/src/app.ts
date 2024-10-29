import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorHandler from '../middleware/errorMiddleware';
import corsMiddleware from '../middleware/corsMiddleware'; 
import userRoutes from '../routes/users';
import emotionRoutes from '../routes/emotions';
import myDayRoutes from '../routes/myDay';
import someoneDayRoutes from '../routes/someoneDay';
import challengeRoutes from '../routes/challenges';

const app = express();

// 환경 변수에 따른 morgan 로깅 설정
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 미들웨어 설정
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'iexist-backend',
    environment: process.env.NODE_ENV
  });
});

// 라우트 설정
app.use('/api/users', userRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/my-day', myDayRoutes);
app.use('/api/someone-day', someoneDayRoutes);
app.use('/api/challenges', challengeRoutes);

// 에러 핸들링 미들웨어
app.use(errorHandler);

export default app;