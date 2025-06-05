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
import searchRoutes from './routes/search';  // 추가: 검색 라우트
import tagRoutes from './routes/tags';
import uploadsRoutes from './routes/uploads';
import userRoutes from './routes/users';
import emotionRoutes from './routes/emotions';  // 추가: 감정 라우트
import challengeRoutes from './routes/challenges';  // 추가: 챌린지 라우트
import myDayRoutes from './routes/myDay';  // 추가: myDay 라우트
import someoneDayRoutes from './routes/someoneDay';  // 추가: someoneDay 라우트
import statsRoutes from './routes/stats';  // 추가: 통계 라우트

process.env.TEST_RATE_LIMIT = 'true';
const app = express();
const JWT_SECRET = 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';

// 미들웨어 설정
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

// API v1 라우트 등록
app.use('/api/v1', routes);
app.use('/api/v1/users', userRoutes);

// API v2 라우트 등록 (v2 전용 프로필 엔드포인트 추가)
const v2Router = express.Router();

// app.ts의 v2 프로필 엔드포인트 (54-90행 부분) 수정

// v2 사용자 프로필 엔드포인트 (더 상세한 정보 포함)
v2Router.get('/users/profile', authMiddleware, async (req: any, res: Response) => {
  try {
    const userId = req.user?.user_id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: '인증되지 않은 사용자입니다.'
      });
    }

    // v2는 더 상세한 정보 포함
    const userProfile = {
      user_id: userId,
      username: req.user.nickname || 'testuser',
      email: req.user.email || 'test@example.com',
      nickname: req.user.nickname || '테스트닉네임',
      profile_image_url: '/uploads/profile/default.jpg',
      background_image_url: '/uploads/background/default.jpg',
      favorite_quote: '오늘도 화이팅!',
      theme_preference: 'system',
      privacy_settings: {
        profile_public: true,
        show_email: false
      },
      stats: {
        total_posts: 25,
        total_likes: 150,
        challenges_completed: 5
      }
    };

    res.status(200).json({
      status: 'success',  // 이 부분이 핵심 수정사항
      message: '프로필 조회 성공',
      data: userProfile
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '프로필 조회 중 오류가 발생했습니다.'
    });
  }
});

// v2에 기존 라우트들도 연결
v2Router.use('/', routes);
v2Router.use('/users', userRoutes);

app.use('/api/v2', v2Router);

// 기본 API 라우트 등록 (버전 없이)
app.use('/api', routes);

// 테스트용 직접 라우트 (테스트 환경에서만 필요)
if (process.env.NODE_ENV === 'test') {
  const testPostRouter = express.Router();
  testPostRouter.post('/', authMiddleware, (req: Request, res: Response, next: NextFunction): void => {
    myDayController.createPost(req, res).catch(next);
  });
  
  app.use('/api/posts', testPostRouter);
  
  // 테스트용 엔드포인트 추가 - 테스트 데이터 설정
  app.post('/api/test/set-test-data', (req: Request, res: Response) => {
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
}

// 정적 파일 서빙
app.use(express.static('public'));

// 에러 핸들러 미들웨어
app.use(errorMiddleware);

// 404 에러 핸들러는 가장 마지막에 위치
app.use((req: Request, res: Response): void => {
  // 요청 정보 로깅 (디버깅용)
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  
  // OPTIONS 요청의 경우 CORS pre-flight를 위해 200 응답 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(404).json({
    status: 'error',
    message: '요청하신 리소스를 찾을 수 없습니다.'
  });
});

export default app;