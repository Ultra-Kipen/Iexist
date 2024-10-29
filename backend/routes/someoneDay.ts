import { Router } from 'express';
import someoneDayController from '../controllers/someoneDayController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, query } from 'express-validator';

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
    body('title').isLength({ min: 5, max: 100 })
      .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    body('content').isLength({ min: 20, max: 2000 })
      .withMessage('내용은 20자 이상 2000자 이하여야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.'),
    body('tag_ids').optional().isArray()
      .withMessage('태그 ID는 배열이어야 합니다.')
  ]),
  (req, res) => someoneDayController.createPost(req as any, res)
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
router.get('/', 
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 })
      .withMessage('페이지 번호는 1 이상이어야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 50 })
      .withMessage('한 페이지당 게시물 수는 1에서 50 사이여야 합니다.'),
    query('sort_by').optional().isIn(['latest', 'popular'])
      .withMessage('정렬 기준이 올바르지 않습니다.'),
    query('tag').optional().isString()
      .withMessage('태그는 문자열이어야 합니다.'),
    query('start_date').optional().isDate()
      .withMessage('시작 날짜 형식이 올바르지 않습니다.'),
    query('end_date').optional().isDate()
      .withMessage('종료 날짜 형식이 올바르지 않습니다.')
  ]),
  (req, res) => someoneDayController.getPosts(req as any, res)
);

/**
 * @swagger
 * /someone-day/popular:
 *   get:
 *     summary: 인기 게시물 조회
 *     tags: [SomeoneDay]
 *     security:
 *       - bearerAuth: []
 */
router.get('/popular',
  authMiddleware,
  (req, res) => someoneDayController.getPopularPosts(req as any, res)
);

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
      .withMessage('신고 사유는 5자 이상 200자 이하여야 합니다.'),
    body('details').optional().isString()
      .withMessage('상세 내용은 문자열이어야 합니다.')
  ]),
  (req, res) => someoneDayController.reportPost(req as any, res)
);

export default router;