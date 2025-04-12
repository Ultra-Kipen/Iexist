import { Router, Request, Response, NextFunction } from 'express';
import challengeController from '../controllers/challengeController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
const { body, param, query } = require('express-validator');

const router = Router();

// 챌린지 생성
router.post(
  '/',   
  [
    authMiddleware,
    body('title')
      .notEmpty()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('설명은 10자 이상 500자 이하여야 합니다.'),
    body('start_date')
      .isISO8601()
      .withMessage('유효한 시작 날짜 형식이어야 합니다.'),
    body('end_date')
      .isISO8601()
      .withMessage('유효한 종료 날짜 형식이어야 합니다.'),
    validateRequest
  ],  
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('챌린지 생성 요청 본문:', req.body);
      return await challengeController.createChallenge(req as any, res);
    } catch (error) {
      console.error('챌린지 생성 라우트 오류:', error);
      next(error);
    }
  }
);

// 챌린지 목록 조회 
router.get(
  '/',
  [
    authMiddleware,
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('페이지 번호는 1 이상이어야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt().withMessage('한 페이지당 1~50개의 항목을 조회할 수 있습니다.'),
    query('status').optional().isIn(['active', 'completed', 'upcoming']).withMessage('상태는 active, completed, upcoming 중 하나여야 합니다.'),
    query('sort_by').optional().isIn(['start_date', 'participant_count', 'created_at']).withMessage('정렬 기준이 올바르지 않습니다.'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('정렬 순서는 asc 또는 desc여야 합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await challengeController.getChallenges(req as any, res);
    } catch (error) {
      next(error);
    }
  }
);

// 챌린지 상세 조회
router.get(
  '/:id',
  [
    authMiddleware,
    param('id').isInt({ min: 1 }).toInt().withMessage('유효한 챌린지 ID가 필요합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await challengeController.getPostDetails(req as any, res);
    } catch (error) {
      next(error);
    }
  }
);

// 챌린지 참여
router.post(
  '/:id/participate',
  [
    authMiddleware,
    param('id').isInt({ min: 1 }).toInt().withMessage('유효한 챌린지 ID가 필요합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await challengeController.participateInChallenge(req as any, res);
    } catch (error) {
      next(error);
    }
  }
);

// 챌린지 진행 상황 업데이트
router.post(
  '/:id/progress',
  [
    authMiddleware,
    param('id').isInt({ min: 1 }).toInt().withMessage('유효한 챌린지 ID가 필요합니다.'),
    body('progress_note')
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('진행 상황 노트는 1자 이상 500자 이하여야 합니다.'),
    body('emotion_id')
      .isInt({ min: 1 })
      .toInt()
      .withMessage('유효한 감정 ID가 필요합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await challengeController.updateChallengeProgress(req as any, res);
    } catch (error) {
      next(error);
    }
  }
);

// 챌린지 탈퇴
router.delete(
  '/:id/participate',
  [
    authMiddleware,
    param('id').isInt({ min: 1 }).toInt().withMessage('유효한 챌린지 ID가 필요합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await challengeController.leaveChallenge(req as any, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;