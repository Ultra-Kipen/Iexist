import { Router } from 'express';
import ComfortWallController from '../controllers/comfortWallController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, param, query } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /api/comfort-wall:
 *   post:
 *     summary: 위로의 벽 게시물 작성
 *     tags: [ComfortWall]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',
  authMiddleware,
  validateRequest([
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    body('content')
      .trim()
      .isLength({ min: 20, max: 2000 })
      .withMessage('내용은 20자 이상 2000자 이하여야 합니다.'),
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  ComfortWallController.createComfortWallPost  // 컨트롤러 메서드명 원래대로 변경
);

/**
 * @swagger
 * /api/comfort-wall:
 *   get:
 *     summary: 위로의 벽 게시물 목록 조회
 *     tags: [ComfortWall]
 */
router.get('/',
  authMiddleware,
  validateRequest([
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('페이지는 1 이상이어야 합니다.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('한 페이지당 1~50개의 게시물을 조회할 수 있습니다.'),
    query('sort')
      .optional()
      .isIn(['recent', 'popular'])
      .withMessage('정렬 기준은 recent 또는 popular여야 합니다.')
  ]),
  ComfortWallController.getComfortWallPosts  // 컨트롤러 메서드명 원래대로 변경
);

/**
 * @swagger
 * /comfort-wall:
 *   post:
 *     summary: 위로의 벽 게시물 작성
 *     tags: [ComfortWall]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',
  authMiddleware,
  validateRequest([
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    body('content')
      .trim()
      .isLength({ min: 20, max: 2000 })
      .withMessage('내용은 20자 이상 2000자 이하여야 합니다.'),
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  (req, res) => ComfortWallController.createComfortWallPost(req as any, res)
);

export default router;