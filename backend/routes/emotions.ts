import { Router, Request, Response, NextFunction } from 'express';
import { AuthRequestGeneric } from '../types/express';
import emotionController from '../controllers/emotionController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware'; 
const expressValidator = require('express-validator');

const router = Router();
const { check } = expressValidator;
const body = check;
const query = check;

interface EmotionTrendQuery {
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
}

router.get('/', emotionController.getAllEmotions);

router.get('/daily-check',
  authMiddleware,
  emotionController.getDailyEmotionCheck
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
  emotionController.getEmotionStats
);

// routes/emotions.ts의 trend 엔드포인트 부분만 수정

router.get('/trend',
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
    query('group_by')
      .optional()
      .isIn(['day', 'week', 'month'])
      .withMessage('group_by는 day, week, month 중 하나여야 합니다.')
  ]),
  async (req, res, next) => {
    try {
      await emotionController.getEmotionTrend(
        req as any,
        res
      );
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  authMiddleware,
  validateRequest([
    body('emotion_ids')
      .isArray()
      .withMessage('감정 ID 배열이 필요합니다.'),
    body('note')
      .optional()
      .isString()
      .withMessage('노트는 문자열이어야 합니다.')
  ]),
  emotionController.createEmotion
);

export default router;