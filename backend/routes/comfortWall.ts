import { Router, Request, Response, RequestHandler } from 'express';
import ComfortWallController from '../controllers/comfortWallController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { AuthRequestGeneric } from '../types/express';

const expressValidator = require('express-validator');

const { check } = expressValidator;
const body = check;
const param = check;
const query = check;

interface ComfortWallPost {
 title: string;
 content: string;
 is_anonymous?: boolean;
}

interface ComfortWallQuery {
 page?: string;
 limit?: string;
 sort?: 'recent' | 'popular';
}

const router = Router();

router.get('/best',
  authMiddleware,
  validateRequest([
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('조회 기간은 daily, weekly, monthly 중 하나여야 합니다.')
  ]),
  (req, res) => ComfortWallController.getBestPosts(req as any, res)
);

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
  (req, res, next) => {
    return ComfortWallController.createComfortWallPost(req as any, res).catch(next);
  }
);

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
 (req: Request, res: Response, next) => {
   const typedReq = req as unknown as AuthRequestGeneric<{}, ComfortWallQuery>;
   return ComfortWallController.getComfortWallPosts(typedReq as AuthRequestGeneric<never, ComfortWallQuery>, res).catch(next);
 }
);

router.post('/:id/message',
 authMiddleware,
 validateRequest([
   param('id')
     .isInt()
     .withMessage('ID는 정수여야 합니다.'),
   body('message')
     .trim()
     .isLength({ min: 1, max: 500 })
     .withMessage('메시지는 1자 이상 500자 이하여야 합니다.'),
   body('is_anonymous')
     .optional()
     .isBoolean()
     .withMessage('익명 여부는 boolean 값이어야 합니다.')
 ]),
 (req, res, next) => {
   const typedReq = req as unknown as AuthRequestGeneric<{ message: string; is_anonymous?: boolean }, never, { id: string }>;
   return ComfortWallController.createComfortMessage(typedReq, res).catch(next);
 }
);

export default router;