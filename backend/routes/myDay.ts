import { Router } from 'express';
import myDayController from '../controllers/myDayController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
const expressValidator = require('express-validator');
const { body, query } = expressValidator;

const router = Router();
// 나머지 코드는 동일
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
      .withMessage('감정 ID는 배열이어야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  (req, res) => myDayController.createPost(req as any, res)
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
router.get('/', 
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 }).withMessage('page는 1 이상의 정수여야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit는 1에서 100 사이의 정수여야 합니다.'),
    query('sort_by').optional().isIn(['latest', 'popular']).withMessage('정렬 기준이 올바르지 않습니다.'),
    query('start_date').optional().isDate().withMessage('시작 날짜 형식이 올바르지 않습니다.'),
    query('end_date').optional().isDate().withMessage('종료 날짜 형식이 올바르지 않습니다.')
  ]),
  (req, res) => myDayController.getPosts(req as any, res)
);

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
      .withMessage('댓글은 1자 이상 300자 이하여야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  (req, res) => myDayController.createComment(req as any, res)
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
router.post('/:id/like', 
  authMiddleware, 
  (req, res) => myDayController.likePost(req as any, res)
);

export default router;