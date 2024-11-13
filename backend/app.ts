import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes'; 
import errorMiddleware from './middleware/errorMiddleware';
import { apiLimiter } from './middleware/rateLimitMiddleware';
import { configSecurity } from './config/security';

const app = express();  // app 인스턴스를 먼저 생성

// CORS 설정
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// CORS Pre-flight 요청 처리
app.options('*', cors(corsOptions));

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 보안 미들웨어
app.use(apiLimiter);
configSecurity(app);

// 루트 경로 처리
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Iexist API Server is running'
  });
});

// API 라우트 설정
app.use('/api', routes);

// 정적 파일 제공
app.use(express.static('public'));

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