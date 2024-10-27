import { Router } from 'express';
import myDayController from '../controllers/myDayController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /my-day:
 *   post:
 *     summary: 나의 하루 게시물 생성
 *     tags: [MyDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',
  authMiddleware,
  validateRequest([
    body('content').isLength({ min: 10, max: 1000 })
      .withMessage('내용은 10자 이상 1000자 이하여야 합니다.'),
    body('emotion_ids').optional().isArray()
      .withMessage('감정 ID는 배열이어야 합니다.')
  ]),
  myDayController.createPost
);

/**
 * @swagger
 * /my-day:
 *   get:
 *     summary: 나의 하루 게시물 목록 조회
 *     tags: [MyDay]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, myDayController.getPosts);

/**
 * @swagger
 * /my-day/{id}/comments:
 *   post:
 *     summary: 게시물에 댓글 작성
 *     tags: [MyDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/comments',
  authMiddleware,
  validateRequest([
    body('content').isLength({ min: 1, max: 300 })
      .withMessage('댓글은 1자 이상 300자 이하여야 합니다.')
  ]),
  myDayController.createComment
);

/**
 * @swagger
 * /my-day/{id}/like:
 *   post:
 *     summary: 게시물 좋아요/좋아요 취소
 *     tags: [MyDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/like', authMiddleware, myDayController.likePost);

export default router;