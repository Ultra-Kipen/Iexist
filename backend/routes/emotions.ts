import { Router } from 'express';
import { Response } from 'express';
import emotionController from '../controllers/emotionController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, query } from 'express-validator';
import { AuthRequest, EmotionTrendQuery, EmotionCreate } from '../types/express';

const router = Router();

// getEmotionStats 함수 정의
function getEmotionStats(req: Request, res: Response) {
  // 함수 로직
  res.send('Emotion stats');
}

// getEmotionTrend 함수 정의
function getEmotionTrend(req: Request, res: Response) {
  // 함수 로직
  res.send('Emotion trend');
}
// 감정 통계 라우트
router.get('/stats',
  authMiddleware,
  [
    query('start_date')
      .isDate()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('end_date')
      .isDate()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다.')
  ],
  validateRequest,
  (req: AuthRequest, res: Response) => {
    return emotionController.getEmotionStats(req as any, res);
  }
);

// 감정 추세 라우트
router.get('/trend',
  authMiddleware,
  [
    query('start_date')
      .isDate()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('end_date')
      .isDate()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('group_by')
      .optional()
      .isIn(['day', 'week', 'month'])
      .withMessage('group_by는 day, week, month 중 하나여야 합니다.')
  ],
  validateRequest,
  (req: AuthRequest, res: Response) => {
    return emotionController.getEmotionTrend(req as any, res);
  }
);

// 감정 생성 라우트
router.post('/log',
  authMiddleware,
  [
    body('emotion_ids')
      .isArray()
      .withMessage('감정 ID 배열이 필요합니다.'),
    body('note')
      .optional()
      .isString()
      .withMessage('노트는 문자열이어야 합니다.')
  ],
  validateRequest,
  (req: AuthRequest, res: Response) => {
    return emotionController.createEmotion(req, res);
  }
);

export default router;