// backend/routes/challenges.ts

import { Router } from 'express';
import challengeController from '../controllers/challengeController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, param, query } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: 새로운 챌린지 생성
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',
  authMiddleware,
  validateRequest([
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    body('description')
      .trim()
      .isLength({ min: 20, max: 500 })
      .withMessage('설명은 20자 이상 500자 이하여야 합니다.'),
    body('start_date')
      .exists()
      .withMessage('시작일은 필수입니다.'),
    body('end_date')
      .exists()
      .withMessage('종료일은 필수입니다.')
  ]),
  challengeController.createChallenge
);

/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: 챌린지 목록 조회
 *     tags: [Challenges]
 */
router.get('/',
  validateRequest([
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('페이지 번호는 1 이상이어야 합니다.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('한 페이지당 1~50개의 항목을 조회할 수 있습니다.'),
    query('status')
      .optional()
      .isIn(['active', 'completed', 'upcoming'])
      .withMessage('상태는 active, completed, upcoming 중 하나여야 합니다.'),
    query('sort_by')
      .optional()
      .isIn(['start_date', 'participant_count', 'created_at'])
      .withMessage('정렬 기준이 올바르지 않습니다.')
  ]),
  challengeController.getChallenges
);

/**
 * @swagger
 * /challenges/{id}/participate:
 *   post:
 *     summary: 챌린지 참여
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/participate',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('유효한 챌린지 ID가 필요합니다.')
  ]),
  challengeController.participateInChallenge
);

/**
 * @swagger
 * /challenges/{id}/progress:
 *   post:
 *     summary: 챌린지 진행 상황 업데이트
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/progress',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('유효한 챌린지 ID가 필요합니다.'),
    body('progress_note')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('진행 상황 노트는 1자 이상 500자 이하여야 합니다.'),
    body('emotion_id')
      .isInt()
      .withMessage('감정 ID가 필요합니다.')
  ]),
  challengeController.updateChallengeProgress
);

export default router;