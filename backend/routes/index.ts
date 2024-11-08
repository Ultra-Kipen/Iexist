import { Router } from 'express';
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
router.use('/my-day', myDayRoutes);      // myday -> my-day
router.use('/someone-day', someoneDayRoutes);  // someoneday -> someone-day
router.use('/emotions', emotionRoutes);
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running'
  });
});

router.use('/challenges', challengeRoutes);
router.use('/comfort-wall', comfortWallRoutes);
router.use('/emotions', emotionRoutes);
router.use('/myday', myDayRoutes);
router.use('/notifications', notificationRoutes);
router.use('/posts', postRoutes);
router.use('/someoneday', someoneDayRoutes);
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