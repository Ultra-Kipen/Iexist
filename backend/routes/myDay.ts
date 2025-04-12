import { Router } from 'express';
import myDayController from '../controllers/myDayController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware'; 
const expressValidator = require('express-validator');
const { body, query, param } = expressValidator;

const router = Router();

router.post('/posts',
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

// 게시물 목록 조회 라우트 추가/수정
router.get('/posts', 
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 }).withMessage('page는 1 이상의 정수여야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit는 1에서 100 사이의 정수여야 합니다.')
  ]),
  (req, res) => myDayController.getPosts(req as any, res)
);

router.get('/posts/me',
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 }).withMessage('page는 1 이상의 정수여야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit는 1에서 100 사이의 정수여야 합니다.')
  ]),
  (req, res) => myDayController.getMyPosts(req as any, res)
);

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

router.post('/:id/like',
  authMiddleware,
  (req, res) => myDayController.likePost(req as any, res)
);

router.delete('/posts/:id',
  authMiddleware,
  validateRequest([
    param('id').isInt({ min: 1 }).withMessage('유효한 게시물 ID가 아닙니다.')
  ]),
  (req, res) => myDayController.deletePost(req as any, res)
);

router.get('/:id/comments',
  authMiddleware,
  validateRequest([
    param('id').isInt({ min: 1 }).withMessage('유효한 게시물 ID가 아닙니다.')
  ]),
  (req, res) => myDayController.getComments(req as any, res)
);

export default router;