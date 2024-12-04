import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
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
router.get('/', authMiddleware, statsController.getUserStats as unknown as RequestHandler);

/**
 * @swagger
 * /stats:
 *   post:
 *     summary: 사용자 통계 업데이트
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 */
router.get('/trends', authMiddleware, statsController.getEmotionTrends as unknown as RequestHandler);

/**
 * @swagger
 * /stats/weekly:
 *   get:
 *     summary: 주간 감정 트렌드 조회
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 */
router.get('/weekly', authMiddleware, (req, res, next) => {
    req.query.type = 'weekly';
    return statsController.getEmotionTrends(req as any, res).catch(next);
  });
  
  /**
 * @swagger
 * /stats/monthly:
 *   get:
 *     summary: 월간 감정 트렌드 조회
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 */
router.get('/monthly', authMiddleware, (req, res, next) => {
    req.query.type = 'monthly';
    return statsController.getEmotionTrends(req as any, res).catch(next);
  });
  
  export default router;