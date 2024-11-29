import { Router } from 'express';
import { Request, Response, RequestHandler } from 'express';
import challengeController from '../controllers/challengeController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
const expressValidator = require('express-validator');

const { check } = expressValidator;
const body = check;
const param = check;
const query = check;

interface ChallengeParams {
  id: number;
}

interface ChallengeProgressBody {
  progress_note: string;
  emotion_id: number;
}

interface AuthRequest<B = any, Q = any, P = any> extends Request<P, any, B, Q> {
  user?: {
    id: number;
    [key: string]: any;
  };
}

const router = Router();
router.use(authMiddleware);  // 모든 챌린지 라우트에 인증 미들웨어 적용
router.post(
  '/',
  authMiddleware,
  validateRequest([
    body('title').trim().isLength({ min: 5, max: 100 }).withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    body('description').optional().trim().isLength({ min: 20, max: 500 }).withMessage('설명은 20자 이상 500자 이하여야 합니다.'),
    body('start_date').isISO8601().withMessage('올바른 시작일 형식이 필요합니다.'),
    body('end_date').isISO8601().withMessage('올바른 종료일 형식이 필요합니다.'),
    body('max_participants').optional().isInt({ min: 2 }).withMessage('최대 참가자 수는 2명 이상이어야 합니다.')
  ]),
  challengeController.createChallenge as unknown as RequestHandler
);

router.get(
  '/',
  validateRequest([
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('페이지 번호는 1 이상이어야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt().withMessage('한 페이지당 1~50개의 항목을 조회할 수 있습니다.'),
    query('status').optional().isIn(['active', 'completed', 'upcoming']).withMessage('상태는 active, completed, upcoming 중 하나여야 합니다.'),
    query('sort_by').optional().isIn(['start_date', 'participant_count', 'created_at']).withMessage('정렬 기준이 올바르지 않습니다.'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('정렬 순서는 asc 또는 desc여야 합니다.')
  ]),
  challengeController.getChallenges as unknown as RequestHandler
);

router.post(
  '/:id/participate',
  authMiddleware,
  validateRequest([
    param('id').isInt({ min: 1 }).toInt().withMessage('유효한 챌린지 ID가 필요합니다.')
  ]),
  challengeController.participateInChallenge as unknown as RequestHandler
);

router.post(
  '/:id/progress',
  authMiddleware,
  validateRequest([
    param('id').isInt({ min: 1 }).toInt().withMessage('유효한 챌린지 ID가 필요합니다.'),
    body('progress_note').trim().isLength({ min: 1, max: 500 }).withMessage('진행 상황 노트는 1자 이상 500자 이하여야 합니다.'),
    body('emotion_id').isInt({ min: 1 }).toInt().withMessage('유효한 감정 ID가 필요합니다.')
  ]),
  challengeController.updateChallengeProgress as unknown as RequestHandler
);

export default router;
