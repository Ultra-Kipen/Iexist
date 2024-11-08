// backend/index.ts
import express from 'express';
import cors from 'cors';
import routes from './routes';
import errorHandler from './middleware/errorMiddleware';
import loggingMiddleware from './middleware/loggingMiddleware';
import corsMiddleware from './middleware/corsMiddleware';
import db from './models';

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// API 라우트
app.use('/api', routes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Iexist API Server is running' });
});

// 에러 핸들링
app.use(errorHandler);

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    
    await db.sequelize.sync();
    console.log('데이터베이스 동기화 완료');

    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
      console.log(`http://localhost:${PORT} 에서 접속 가능합니다.`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('서버를 종료합니다.');
  process.exit();
});

process.on('SIGINT', () => {
  console.log('서버를 종료합니다.');
  process.exit();
});

// API 라우트
app.use('/api', routes);

// 라우트 디버깅 (선택사항)
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(`등록된 라우트: ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
  }
});

export default app;