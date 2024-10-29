import { Router } from 'express';
import emotionController from '../controllers/emotionController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, query } from 'express-validator';

const router = Router();

// 감정 목록 조회
router.get('/', emotionController.getAllEmotions);

// 감정 로그 생성
router.post('/log', 
  authMiddleware, 
  validateRequest([
    body('emotion_ids').isArray().withMessage('감정 ID 배열이 필요합니다.'),
    body('emotion_ids.*').isInt().withMessage('감정 ID는 정수여야 합니다.'),
    body('note').optional().isString().withMessage('노트는 문자열이어야 합니다.')
  ]), 
  emotionController.createEmotion as any
);

// 감정 로그 조회
router.get('/logs', 
  authMiddleware,
  validateRequest([
    query('limit').optional().isInt({ min: 1, max: 100 })
      .withMessage('limit는 1에서 100 사이의 숫자여야 합니다.'),
    query('offset').optional().isInt({ min: 0 })
      .withMessage('offset은 0 이상의 숫자여야 합니다.')
  ]),
  emotionController.getEmotions as any
);

// 감정 통계
router.get('/stats', 
  authMiddleware,
  validateRequest([
    query('start_date').isString().withMessage('시작 날짜가 필요합니다.'),
    query('end_date').isString().withMessage('종료 날짜가 필요합니다.')
  ]), 
  emotionController.getEmotionStats as any
);

// 감정 추세
router.get('/trend',
  authMiddleware,
  validateRequest([
    query('start_date').isString().withMessage('시작 날짜가 필요합니다.'),
    query('end_date').isString().withMessage('종료 날짜가 필요합니다.'),
    query('group_by').optional().isIn(['day', 'week', 'month'])
      .withMessage('group_by는 day, week, month 중 하나여야 합니다.')
  ]),
  emotionController.getEmotionTrend as any
);

// 일일 감정 체크 확인
router.get('/daily-check',
  authMiddleware,
  emotionController.getDailyEmotionCheck as any
);

export default router;