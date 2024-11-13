import { Router } from 'express';
import authRoutes from './auth';
import challengeRoutes from './challenges';
import comfortWallRoutes from './comfortWall';
import emotionRoutes from './emotions';
import myDayRoutes from './myDay';
import notificationRoutes from './notifications';
import postRoutes from './posts';
import someoneDayRoutes from './someoneDay';
import statsRoutes from './stats';
import userRoutes from './users';

const router = Router();

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

// API 상태 체크 라우트
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    version: '1.0.0'
  });
});

export default router;