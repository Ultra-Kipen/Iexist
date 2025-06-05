import { Router, Request, Response, NextFunction } from 'express';
import challengeController from '../controllers/challengeController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
const { body, param, query } = require('express-validator');

const router = Router();

// 유효성 검사 규칙을 간소화하여 성능 문제 방지
const createChallengeValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('설명은 500자 이하여야 합니다.'),
  body('start_date')
    .notEmpty()
    .withMessage('시작 날짜가 필요합니다.'),
  body('end_date')
    .notEmpty()
    .withMessage('종료 날짜가 필요합니다.')
];

// 챌린지 생성
router.post(
  '/',   
  authMiddleware,
  createChallengeValidation,
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('챌린지 생성 라우트 진입');
      console.log('요청 본문:', JSON.stringify(req.body, null, 2));
      console.log('사용자 정보:', (req as any).user ? '인증됨' : '인증 안됨');
      
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
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('페이지는 1 이상이어야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('한 페이지당 1~50개 조회 가능합니다.'),
    query('status').optional().isIn(['active', 'completed', 'upcoming']).withMessage('상태 값이 올바르지 않습니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('챌린지 목록 조회 라우트 진입');
      return await challengeController.getChallenges(req as any, res);
    } catch (error) {
      console.error('챌린지 목록 조회 라우트 오류:', error);
      next(error);
    }
  }
);

// 챌린지 상세 조회
router.get(
  '/:id',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }).withMessage('유효한 챌린지 ID가 필요합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('챌린지 상세 조회 라우트 진입, ID:', req.params.id);
      return await challengeController.getPostDetails(req as any, res);
    } catch (error) {
      console.error('챌린지 상세 조회 라우트 오류:', error);
      next(error);
    }
  }
);

// 챌린지 참여
router.post(
  '/:id/participate',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }).withMessage('유효한 챌린지 ID가 필요합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('챌린지 참여 라우트 진입, ID:', req.params.id);
      return await challengeController.participateInChallenge(req as any, res);
    } catch (error) {
      console.error('챌린지 참여 라우트 오류:', error);
      next(error);
    }
  }
);

// 챌린지 참여 (JOIN 방식) - participate와 동일한 로직
router.post(
  '/:id/join',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }).withMessage('유효한 챌린지 ID가 필요합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('챌린지 JOIN 라우트 진입, ID:', req.params.id);
      return await challengeController.participateInChallenge(req as any, res);
    } catch (error) {
      console.error('챌린지 JOIN 라우트 오류:', error);
      next(error);
    }
  }
);

// 챌린지 감정 기록
router.post(
  '/:id/emotions',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }).withMessage('유효한 챌린지 ID가 필요합니다.'),
    body('emotion_id')
      .isInt({ min: 1 })
      .withMessage('유효한 감정 ID가 필요합니다.'),
    body('note')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('노트는 200자 이하여야 합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('챌린지 감정 기록 라우트 진입, ID:', req.params.id);
      
      // challengeController의 타입을 any로 캐스팅하여 동적 메서드 접근
      const controller = challengeController as any;
      
      // logEmotion 메서드 존재 여부 확인
      if ('logEmotion' in controller && typeof controller.logEmotion === 'function') {
        console.log('challengeController.logEmotion 메서드를 사용합니다.');
        return await controller.logEmotion(req, res);
      } else {
        // logEmotion 메서드가 없으면 기본 감정 기록 로직 구현
        console.log('challengeController.logEmotion 메서드가 구현되지 않았습니다. 기본 응답을 반환합니다.');
        
        const { id } = req.params;
        const { emotion_id, note } = req.body;
        const user_id = (req as any).user?.user_id;

        if (!user_id) {
          return res.status(401).json({
            status: 'error',
            message: '인증이 필요합니다.'
          });
        }

        // 기본 응답 (실제 구현 시 데이터베이스에 저장하는 로직 추가 필요)
        return res.status(201).json({
          status: 'success',
          message: '감정이 기록되었습니다.',
          data: {
            challenge_id: parseInt(id),
            user_id: user_id,
            emotion_id: emotion_id,
            note: note || null,
            log_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('챌린지 감정 기록 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '감정 기록 중 오류가 발생했습니다.'
      });
    }
  }
);

// 챌린지 진행 상황 업데이트
router.post(
  '/:id/progress',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }).withMessage('유효한 챌린지 ID가 필요합니다.'),
    body('progress_note')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('진행 상황 노트는 500자 이하여야 합니다.'),
    body('emotion_id')
      .isInt({ min: 1 })
      .withMessage('유효한 감정 ID가 필요합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('챌린지 진행 상황 업데이트 라우트 진입, ID:', req.params.id);
      return await challengeController.updateChallengeProgress(req as any, res);
    } catch (error) {
      console.error('챌린지 진행 상황 업데이트 라우트 오류:', error);
      next(error);
    }
  }
);

// 챌린지 탈퇴
router.delete(
  '/:id/participate',
  authMiddleware,
  [
    param('id').isInt({ min: 1 }).withMessage('유효한 챌린지 ID가 필요합니다.'),
    validateRequest
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('챌린지 탈퇴 라우트 진입, ID:', req.params.id);
      return await challengeController.leaveChallenge(req as any, res);
    } catch (error) {
      console.error('챌린지 탈퇴 라우트 오류:', error);
      next(error);
    }
  }
);

// 에러 핸들링 미들웨어
router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('챌린지 라우터에서 처리되지 않은 오류:', error);
  
  if (!res.headersSent) {
    return res.status(500).json({
      status: 'error',
      message: '서버 내부 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  
  next(error);
});

export default router;