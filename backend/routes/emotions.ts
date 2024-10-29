import { Router } from 'express';
import emotionController from '../controllers/emotionController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest, body, query, commonValidations } from '../middleware/validationMiddleware';

const router = Router();

// 감정 목록 조회
router.get('/', emotionController.getAllEmotions);

// 감정 로그 생성
router.post('/log', 
  authMiddleware, 
  validateRequest([
    ...commonValidations.emotionIds,
    body('note')
      .optional()
      .isString()
      .withMessage('노트는 문자열이어야 합니다.')
  ]), 
  emotionController.createEmotion
);

// 감정 로그 조회
router.get('/logs', 
  authMiddleware,
  validateRequest([
    ...commonValidations.pagination
  ]),
  emotionController.getEmotions
);

// 감정 통계
router.get('/stats', 
  authMiddleware,
  validateRequest([
    ...commonValidations.dateRange
  ]), 
  emotionController.getEmotionStats
);

// 감정 추세
router.get('/trend',
  authMiddleware,
  validateRequest([
    ...commonValidations.dateRange,
    query('group_by')
      .optional()
      .isIn(['day', 'week', 'month'])
      .withMessage('group_by는 day, week, month 중 하나여야 합니다.')
  ]),
  emotionController.getEmotionTrend
);

// 일일 감정 체크 확인
router.get('/daily-check',
  authMiddleware,
  emotionController.getDailyEmotionCheck
);

export default router;