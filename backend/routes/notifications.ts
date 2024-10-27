import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: 알림 목록 조회
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, notificationController.getNotifications);

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

export default router;