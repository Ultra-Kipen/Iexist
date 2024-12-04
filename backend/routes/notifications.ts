import { Router, Request, Response } from 'express';
import notificationController from '../controllers/notificationController';
import authMiddleware from '../middleware/authMiddleware';
import { AuthRequestGeneric } from '../types/express';
import { validateRequest } from '../middleware/validationMiddleware';
const expressValidator = require('express-validator');
const { query } = expressValidator;

interface NotificationQuery {
  page?: string;
  limit?: string;
}

const router = Router();

router.get('/', 
  authMiddleware,
  validateRequest([
	query('page').optional().isInt({ min: 1 }).withMessage('page는 1 이상의 정수여야 합니다.'),
	query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit는 1에서 50 사이의 정수여야 합니다.')
  ]),
  (req: Request, res: Response, next) => {
	const typedReq = req as unknown as AuthRequestGeneric<never, NotificationQuery>;
	return notificationController.getNotifications(typedReq, res).catch(next);
  }
);
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: 알림 목록 조회
 *     tags: [Notifications]
 *     security: []
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   post:
 *     summary: 알림 읽음 처리
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/read', authMiddleware, notificationController.markNotificationAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: 알림 삭제
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, notificationController.deleteNotification);
/**
 * @swagger
 * /notifications/mark-all-read:
 *   post:
 *     summary: 모든 알림 읽음 처리
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/mark-all-read', authMiddleware, notificationController.markAllAsRead);

export default router;