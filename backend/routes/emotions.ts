import { Router, Request, Response } from 'express';
import emotionController from '../controllers/emotionController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware'; 
import { AuthRequest } from '../types/express';
const expressValidator = require('express-validator');

const router = Router();

// express-validator에서 필요한 함수들 추출
const { check } = expressValidator;
const body = check;
const query = check;

// 감정 통계 라우트
router.get('/stats',
  authMiddleware,
  validateRequest([
    query('start_date')
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('end_date')
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다.')
  ]),
  (req: AuthRequest, res: Response) => emotionController.getEmotionStats(req as any, res)
);
// 감정 추세 라우트
router.get('/trend',
  authMiddleware,
  validateRequest([
    query('start_date')
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('end_date')
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('group_by')
      .optional()
      .isIn(['day', 'week', 'month'])
      .withMessage('group_by는 day, week, month 중 하나여야 합니다.')
  ]),
  (req: AuthRequest, res: Response) => emotionController.getEmotionTrend(req as any, res)
);

// 감정 생성 라우트
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
  (req: AuthRequest, res: Response) => emotionController.createEmotion(req, res)
);

// GET /api/emotions
router.get('/', emotionController.getAllEmotions);

export default router;