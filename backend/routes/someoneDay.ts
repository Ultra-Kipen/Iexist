import { Router } from 'express';
import someoneDayController from '../controllers/someoneDayController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /someone-day:
 *   post:
 *     summary: 누군가의 하루 게시물 생성
 *     tags: [SomeoneDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',
  authMiddleware,
  validateRequest([
    body('title').notEmpty().withMessage('제목은 필수입니다.'),
    body('content').isLength({ min: 20, max: 2000 })
      .withMessage('내용은 20자 이상 2000자 이하여야 합니다.')
  ]),
  someoneDayController.createPost
);

/**
 * @swagger
 * /someone-day:
 *   get:
 *     summary: 누군가의 하루 게시물 목록 조회
 *     tags: [SomeoneDay]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, someoneDayController.getPosts);

/**
 * @swagger
 * /someone-day/popular:
 *   get:
 *     summary: 인기 게시물 조회
 *     tags: [SomeoneDay]
 */
router.get('/popular', someoneDayController.getPopularPosts);

/**
 * @swagger
 * /someone-day/{id}/report:
 *   post:
 *     summary: 게시물 신고
 *     tags: [SomeoneDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/report',
  authMiddleware,
  validateRequest([
    body('reason').isLength({ min: 5, max: 200 })
      .withMessage('신고 사유는 5자 이상 200자 이하여야 합니다.')
  ]),
  someoneDayController.reportPost
);

export default router;