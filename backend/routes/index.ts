import { Router } from 'express';
import userRoutes from './users';
import emotionRoutes from './emotions';
import myDayRoutes from './myDay';
import someoneDayRoutes from './someoneDay';
import challengeRoutes from './challenges';
import statsRoutes from './stats';
import notificationRoutes from './notifications';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API Routes
router.use('/users', userRoutes);
router.use('/emotions', emotionRoutes);
router.use('/my-day', myDayRoutes);
router.use('/someone-day', someoneDayRoutes);
router.use('/challenges', challengeRoutes);
router.use('/stats', statsRoutes);
router.use('/notifications', notificationRoutes);

export default router;