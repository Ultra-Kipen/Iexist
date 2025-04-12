// routes/index.ts 수정
import { Router } from 'express';
import authRoutes from './auth';
import challengeRoutes from './challenges';
import comfortWallRoutes, { comfortWallController } from './comfortWall';
import emotionRoutes from './emotions';
import myDayRoutes from './myDay';
import notificationRoutes from './notifications';
import postRoutes from './posts';
import someoneDayRoutes from './someoneDay';
import statsRoutes from './stats';
import userRoutes from './users';
import tagRoutes from './tags';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// comfortWallController를 export
export { comfortWallController };

// Auth 라우트 추가
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

// API 상태 체크 라우트
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    version: '1.0.0'
  });
});

// 보호된 라우트 (인증 필요)
router.get('/protected-route', authMiddleware, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Token is valid'
  });
});

export default router;