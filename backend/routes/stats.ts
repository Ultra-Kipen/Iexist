import { Router } from 'express';
import statsController from '../controllers/statsController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: 사용자 통계 조회
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, statsController.getUserStats);

/**
 * @swagger
 * /stats:
 *   post:
 *     summary: 사용자 통계 업데이트
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 */
router.get('/trends', authMiddleware, statsController.getEmotionTrends);

export default router;