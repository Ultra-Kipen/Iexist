import { Router } from 'express';
import emotionController from '../controllers/emotionController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, query } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /emotions/log:
 *   post:
 *     summary: 감정 기록 생성
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/log', 
  authMiddleware, 
  validateRequest([
    body('emotion_ids').isArray().withMessage('감정 ID 배열이 필요합니다.'),
    body('emotion_ids.*').isInt().withMessage('감정 ID는 정수여야 합니다.'),
    body('note').optional().isString().withMessage('노트는 문자열이어야 합니다.')
  ]), 
  emotionController.createEmotion
);

/**
 * @swagger
 * /emotions/logs:
 *   get:
 *     summary: 감정 로그 조회
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/logs', 
  authMiddleware,
  validateRequest([
    query('limit').optional().isInt({ min: 1, max: 100 })
  ]),
  emotionController.getEmotions
);

/**
 * @swagger
 * /emotions/stats:
 *   get:
 *     summary: 감정 통계 조회
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', 
  authMiddleware, 
  emotionController.getEmotionStats
);

/**
 * @swagger
 * /emotions/trend:
 *   get:
 *     summary: 감정 추세 조회
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/trend',
  authMiddleware,
  validateRequest([
    query('start_date').isDate(),
    query('end_date').isDate()
  ]),
  emotionController.getEmotionTrend
);

/**
 * @swagger
 * /emotions/daily-check:
 *   get:
 *     summary: 일일 감정 체크 확인
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/daily-check',
  authMiddleware,
  emotionController.getDailyEmotionCheck
);

/**
 * @swagger
 * /emotions:
 *   get:
 *     summary: 모든 감정 목록 조회
 *     tags: [Emotions]
 */
router.get('/', emotionController.getAllEmotions);

export default router;