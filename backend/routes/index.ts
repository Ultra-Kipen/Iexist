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

export default router;