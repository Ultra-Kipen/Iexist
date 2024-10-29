import { Router } from 'express';
import postController from '../controllers/postController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, query } from 'express-validator';
import { AuthRequest, PaginationQuery } from '../types/express';

// Request 타입 정의
interface CreatePostRequest {
  content: string;
  emotion_ids?: number[];
  emotion_summary?: string;
  image_url?: string;
  is_anonymous?: boolean;
}

interface PostParams {
  id: string;
}

interface PostQuery extends PaginationQuery {
  sort_by?: 'latest' | 'popular';
  emotion?: string;
  start_date?: string;
  end_date?: string;
}

interface PostComment {
  content: string;
  is_anonymous?: boolean;
}

const router = Router();

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: 게시물 작성
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',
  authMiddleware,
  validateRequest([
    body('content').isLength({ min: 10, max: 1000 })
      .withMessage('게시물 내용은 10자 이상 1000자 이하여야 합니다.'),
    body('emotion_ids').optional().isArray()
      .withMessage('감정 ID 배열이 올바르지 않습니다.')
  ]),
  postController.createPost
);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: 게시물 목록 조회
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/',
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 })
      .withMessage('페이지 번호는 1 이상이어야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 50 })
      .withMessage('한 페이지당 1~50개의 게시물을 조회할 수 있습니다.'),
    query('sort_by').optional().isIn(['latest', 'popular'])
      .withMessage('정렬 기준이 올바르지 않습니다.')
  ]),
  postController.getPosts
);

/**
 * @swagger
 * /posts/my:
 *   get:
 *     summary: 내 게시물 목록 조회
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my', 
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 })
      .withMessage('페이지 번호는 1 이상이어야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 50 })
      .withMessage('한 페이지당 1~50개의 게시물을 조회할 수 있습니다.')
  ]),
  postController.getMyPosts
);

/**
 * @swagger
 * /posts/{id}/comments:
 *   post:
 *     summary: 댓글 작성
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/comments',
  authMiddleware,
  validateRequest([
    body('content').isLength({ min: 1, max: 300 })
      .withMessage('댓글 내용은 1자 이상 300자 이하여야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  // 타입 캐스팅을 제거하고 컨트롤러 직접 사용
  postController.createComment
);

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: 게시물 좋아요
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/like', 
  authMiddleware,
  postController.likePost
);

export default router;