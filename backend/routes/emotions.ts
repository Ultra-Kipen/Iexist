import { Router, Request, Response, NextFunction } from 'express';
import { AuthRequestGeneric } from '../types/express';
import * as emotionController from '../controllers/emotionController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware'; 
const expressValidator = require('express-validator');

const router = Router();
const { check } = expressValidator;
const query = check;

interface EmotionTrendQuery {
  start_date?: string;
  end_date?: string;
  type?: 'day' | 'week' | 'month';
}

router.get('/', emotionController.getAllEmotions);

router.get('/daily-check',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    const typedReq = req as unknown as AuthRequestGeneric<never>;
    emotionController.getDailyEmotionCheck(typedReq, res).catch(next);
  }
);

router.get('/stats',
  authMiddleware,
  validateRequest([
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('end_date')
      .optional()
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다.')
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    const typedReq = req as unknown as AuthRequestGeneric<never, { start_date?: string; end_date?: string }>;
    emotionController.getEmotionStats(typedReq, res).catch(next);
  }
);

router.get('/trends',  
  authMiddleware,
  validateRequest([
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('end_date') 
      .optional()
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('type')
      .optional()
      .isIn(['day', 'week', 'month', 'monthly'])
      .withMessage('type은 day, week, month, monthly 중 하나여야 합니다.')
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    const typedReq = req as unknown as AuthRequestGeneric<never, EmotionTrendQuery>;
    emotionController.getEmotionTrend(typedReq, res).catch(next);
  }
);

router.post('/',
  authMiddleware,
  validateRequest([
    check('emotion_ids')
      .isArray()
      .withMessage('하나 이상의 감정을 선택해주세요.')
      .custom((value: unknown) => Array.isArray(value) && value.length > 0)
      .withMessage('하나 이상의 감정을 선택해주세요.'),
    check('note')
      .optional()
      .isString()
      .withMessage('노트는 문자열이어야 합니다.')
      .trim()
      .isLength({ max: 200 })
      .withMessage('노트는 200자 이하여야 합니다.')
  ]),
  (req, res, next) => {
    emotionController.createEmotion(req as AuthRequestGeneric<{ emotion_ids: number[]; note?: string }>, res)
      .catch(next);
  }
);

export default router;