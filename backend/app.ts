// app.ts 수정
import express, { NextFunction, Request, Response } from 'express';
import { configSecurity } from './config/security';
import myDayController from './controllers/myDayController';
import userController from './controllers/userController';
import authMiddleware, { registerTestUser } from './middleware/authMiddleware';
import { corsMiddleware } from './middleware/corsMiddleware';
import errorMiddleware from './middleware/errorMiddleware';
import { apiLimiter } from './middleware/rateLimitMiddleware';
import routes, { comfortWallController } from './routes';
import comfortWallRoutes from './routes/comfortWall';
import notificationRoutes from './routes/notifications';
import tagRoutes from './routes/tags';
import uploadsRoutes from './routes/uploads';
import userRoutes from './routes/users';
process.env.TEST_RATE_LIMIT = 'true';
const app = express();
const JWT_SECRET = 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(apiLimiter);
}
configSecurity(app);

// 최상위 루트 경로
app.get('/', (req: Request, res: Response): void => {
  res.json({
    status: 'success',
    message: 'Iexist API Server is running'
  });
});

// 기존 API 경로
app.use('/api', routes);

// 테스트를 위한 직접 라우트 등록
app.use('/api/users', userRoutes);
app.use('/api/comfort-wall', comfortWallRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadsRoutes);

// 테스트용 라우트
const testPostRouter = express.Router();
testPostRouter.post('/', authMiddleware, (req: Request, res: Response, next: NextFunction): void => {
  myDayController.createPost(req, res).catch(next);
});

app.use('/api/posts', testPostRouter);

// 이 라우트 제거 (routes/index.ts에서 처리)
// app.get('/api/protected-route', authMiddleware, (req: Request, res: Response): void => {
//   res.status(200).json({ 
//     status: 'success', 
//     message: 'Token is valid' 
//   });
// });

// 테스트용 엔드포인트 추가 - 테스트 데이터 설정
app.post('/api/test/set-test-data', (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'test') {
    return res.status(403).json({
      status: 'error',
      message: '테스트 환경에서만 사용 가능합니다.'
    });
  }

  const { user1, postId } = req.body;
  
  // 테스트 사용자 등록
  if (user1 && user1.user_id) {
    registerTestUser(user1.user_id, {
      email: user1.email,
      nickname: user1.nickname
    });
    console.log('테스트 사용자 등록:', user1.user_id);
  }
  
  // ComfortWallController에서 정의한 함수 호출
  if (typeof comfortWallController.setTestData === 'function') {
    comfortWallController.setTestData(user1, postId);
  }
  
  return res.json({
    status: 'success',
    message: '테스트 데이터가 설정되었습니다.'
  });
});

// 테스트를 위한 추가 엔드포인트
app.post('/api/users/block', authMiddleware, userController.blockUser);
app.delete('/api/users/block', authMiddleware, userController.unblockUser);
app.put('/api/users/profile', authMiddleware, userController.updateProfile);
app.put('/api/users/notification-settings', authMiddleware, userController.updateNotificationSettings);

app.use(express.static('public'));
app.use(errorMiddleware);
app.use('/api/tags', tagRoutes);

// 404 에러 핸들러는 가장 마지막에 위치
app.use((req: Request, res: Response): void => {
  // 요청 정보 로깅 (디버깅용)
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  
  res.status(404).json({
    status: 'error',
    message: '요청하신 리소스를 찾을 수 없습니다.'
  });
});

export default app;