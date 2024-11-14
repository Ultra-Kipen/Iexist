import { Router, Request, Response } from 'express';
import emotionController from '../controllers/emotionController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware'; 
import { AuthRequest } from '../types/express';
const expressValidator = require('express-validator');

const router = Router();

const { check } = expressValidator;
const body = check;
const query = check;

// 감정 목록 조회
router.get('/', emotionController.getAllEmotions);

// 감정 통계 조회
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
  emotionController.getEmotionStats as any
);

// 감정 추세 조회
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
  emotionController.getEmotionTrend
);

// 감정 생성
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