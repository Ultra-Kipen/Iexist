import { Router, Request, Response } from 'express';
import postController from '../controllers/postController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest, commonValidations } from '../middleware/validationMiddleware';
import { AuthRequestGeneric } from '../types/express';
const expressValidator = require('express-validator');
const { body, query, param } = expressValidator;

const router = Router();
// 나머지 코드는 동일
router.post('/',
  authMiddleware,
  validateRequest([
    body('content')
      .isLength({ min: 10, max: 1000 })
      .withMessage('게시물 내용은 10자 이상 1000자 이하여야 합니다.'),
    body('emotion_ids')
      .optional()
      .isArray()
      .withMessage('감정 ID 배열이 올바르지 않습니다.'),
    body('emotion_ids.*')
      .optional()
      .isInt()
      .withMessage('감정 ID는 정수여야 합니다.'),
    body('emotion_summary')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('감정 요약은 100자를 초과할 수 없습니다.'),
    body('image_url')
      .optional()
      .isURL()
      .withMessage('유효한 이미지 URL이 아닙니다.'),
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  postController.createPost
);

router.get('/',
  authMiddleware,
  validateRequest([
    ...commonValidations.pagination,
    query('sort_by')
      .optional()
      .isIn(['latest', 'popular'])
      .withMessage('정렬 기준이 올바르지 않습니다.'),
    query('emotion')
      .optional()
      .isString()
      .withMessage('감정 필터가 올바르지 않습니다.'),
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('시작 날짜 형식이 올바르지 않습니다.'),
    query('end_date')
      .optional()
      .isISO8601()
      .withMessage('종료 날짜 형식이 올바르지 않습니다.')
  ]),
  postController.getPosts
);

router.get('/my', 
  authMiddleware,
  validateRequest([...commonValidations.pagination]),
  postController.getMyPosts
);

router.post('/:id/comments',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.'),
    body('content')
      .isLength({ min: 1, max: 300 })
      .withMessage('댓글 내용은 1자 이상 300자 이하여야 합니다.'),
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  (req: Request, res: Response) => {
    const typedReq = req as AuthRequestGeneric<{
      content: string;
      is_anonymous?: boolean;
    }, never, { id: string }>;
    return postController.createComment(typedReq, res);
  }
);

router.post('/:id/like',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.')
  ]),
  (req: Request, res: Response) => {
    const typedReq = req as AuthRequestGeneric<never, never, { id: string }>;
    return postController.likePost(typedReq, res);
  }
);

export default router;