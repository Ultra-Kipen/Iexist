// routes/index.ts 수정
import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import challengeRoutes from './challenges';
import comfortWallRoutes, { comfortWallController } from './comfortWall';
import emotionRoutes from './emotions';
import myDayRoutes from './myDay';
import notificationRoutes from './notifications';
import postRoutes from './posts';
import searchRoutes from './search';
import someoneDayRoutes from './someoneDay';
import statsRoutes from './stats';
import tagRoutes from './tags';
import uploadsRoutes from './uploads';
import userRoutes from './users';
import authMiddleware from '../middleware/authMiddleware';
import db from '../models';

const router = Router();

// comfortWallController를 export
export { comfortWallController };

// API 상태 확인 엔드포인트 추가
router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 루트 경로에 대한 모든 HTTP 메서드 처리
router.all('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'API is running',
    version: '1.0.0'
  });
});

// Goals 라우트 추가 (기본 목표 관리)
router.get('/goals', authMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: '목표 목록을 조회했습니다.'
  });
});

router.post('/goals', authMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '목표가 생성되었습니다.'
  });
});

// 테스트용 알림 트리거 엔드포인트 추가
router.post('/test/notifications', authMiddleware, async (req, res) => {
  try {
    const user_id = (req as any).user?.user_id;
    
    if (!user_id) {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    // 테스트용 알림 생성
    const testNotification = await db.Notification.create({
      user_id: user_id,
      content: '테스트 알림입니다.',
      notification_type: 'system',
      is_read: false,
      created_at: new Date()
    });

    res.json({
      success: true,
      data: testNotification,
      message: '테스트 알림이 생성되었습니다.'
    });
  } catch (error) {
    console.error('테스트 알림 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '테스트 알림 생성 중 오류가 발생했습니다.'
    });
  }
});

// 모든 라우트 등록
router.use('/auth', authRoutes);
router.use('/my-day', myDayRoutes);
router.use('/someone-day', someoneDayRoutes);
router.use('/emotions', emotionRoutes);
router.use('/challenges', challengeRoutes);
router.use('/comfort-wall', comfortWallRoutes);
router.use('/notifications', notificationRoutes);
router.use('/posts', postRoutes);
router.use('/stats', statsRoutes);
router.use('/users', userRoutes);
router.use('/tags', tagRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/search', searchRoutes);

// 보호된 라우트 (인증 필요)
router.get('/protected-route', authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Token is valid'
  });
});

export default router;