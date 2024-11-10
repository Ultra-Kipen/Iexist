import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import errorMiddleware from './middleware/errorMiddleware';
import { apiLimiter } from './middleware/rateLimitMiddleware';
import { configSecurity } from './config/security';

const app = express();

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (config.cors.allowedOrigins.includes(origin || '')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 보안 미들웨어
app.use(cors(corsOptions)); // CORS 설정 추가
app.use(apiLimiter);
configSecurity(app);

// API 라우트 설정
app.use('/api', routes);

// 에러 핸들링
app.use(errorMiddleware);

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '요청하신 리소스를 찾을 수 없습니다.'
  });
});

export default app;