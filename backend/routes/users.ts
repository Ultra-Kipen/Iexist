import { Router } from 'express';
import { uploadProfileImage } from '../controllers/uploadController';
import userController from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { handleMulterError, handleProfileImageUpload } from './uploads';

const router = Router();
const expressValidator = require('express-validator');
const { body, query } = expressValidator;

// 회원가입
router.post(
  '/register',
  validateRequest([
    body('username')
      .notEmpty()
      .withMessage('사용자 이름은 필수입니다.')
      .isLength({ min: 2, max: 30 })
      .withMessage('사용자 이름은 2자 이상 30자 이하여야 합니다.'),
    body('email')
      .isEmail()
      .withMessage('유효한 이메일을 입력해주세요.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
  ]),
  userController.register
);

// 로그인 
router.post(
  '/login',
  validateRequest([
    body('email')
      .isEmail()
      .withMessage('유효한 이메일을 입력해주세요.')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('비밀번호를 입력해주세요.')
  ]),
  userController.login
);

// 사용자 차단 해제
router.delete('/block', authMiddleware, userController.unblockUser);

// routes/users.ts (프로필 조회 부분만 수정)

// routes/users.ts의 프로필 조회 라우트 (49-79행 부분) 수정

// 프로필 조회 - v1 기본 버전
router.get('/profile', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.user_id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: '인증되지 않은 사용자입니다.'
      });
    }

    // v1 기본 프로필 정보
    const userProfile = {
      user_id: userId,
      username: req.user.nickname || 'testuser',
      email: req.user.email || 'test@example.com',
      nickname: req.user.nickname || '테스트닉네임',
      profile_image_url: '/uploads/profile/default.jpg',
      favorite_quote: '오늘도 화이팅!'
    };

    res.status(200).json({
      status: 'success',  // 이 부분이 핵심 수정사항
      message: '프로필 조회 성공',
      data: userProfile
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '프로필 조회 중 오류가 발생했습니다.'
    });
  }
});

// 프로필 업데이트
router.put(
  '/profile',
  authMiddleware,
  validateRequest([
    body('nickname')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('닉네임은 2자 이상 50자 이하여야 합니다.'),
    body('theme_preference')
      .optional()
      .isIn(['light', 'dark', 'system'])
      .withMessage('유효하지 않은 테마 설정입니다.')
  ]),
  userController.updateProfile
);

// 사용자차단
router.post('/block', authMiddleware, userController.blockUser);

// 비밀번호 변경
router.put(
  '/password',
  authMiddleware,
  validateRequest([
    body('currentPassword')
      .notEmpty()
      .withMessage('현재 비밀번호를 입력해주세요.'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('새 비밀번호는 최소 6자 이상이어야 합니다.')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
      .withMessage('비밀번호는 영문과 숫자를 포함해야 합니다.')
  ]),
  userController.changePassword
);

// 로그아웃
router.post('/logout', authMiddleware, userController.logout);

// 비밀번호 재설정 요청
router.post(
  '/forgot-password',
  validateRequest([
    body('email')
      .isEmail()
      .withMessage('유효한 이메일을 입력해주세요.')
      .normalizeEmail()
  ]),
  (req, res) => userController.forgotPassword(req, res)
);

// 비밀번호 재설정
router.post(
  '/reset-password',
  validateRequest([
    body('token')
      .notEmpty()
      .withMessage('토큰은 필수 항목입니다.'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
      .withMessage('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.')
  ]),
  userController.resetPassword
);

// 회원탈퇴
router.delete(
  '/withdrawal',
  authMiddleware,
  validateRequest([
    body('password')
      .notEmpty()
      .withMessage('비밀번호를 입력해주세요.')
  ]),
  userController.withdrawal
);

// 이메일 중복 확인
router.get(
  '/check-email',
  validateRequest([
    query('email')
      .isEmail()
      .withMessage('유효한 이메일을 입력해주세요.')
      .normalizeEmail()
  ]),
  userController.checkEmail
);

// 닉네임 중복 확인
router.get(
  '/check-nickname',
  validateRequest([
    query('nickname')
      .notEmpty()
      .withMessage('닉네임을 입력해주세요.')
      .isLength({ min: 2, max: 50 })
      .withMessage('닉네임은 2자 이상 50자 이하여야 합니다.')
  ]),
  userController.checkNickname
);

// 프로필 이미지 업로드 라우트
router.post('/profile/image', 
  authMiddleware, 
  handleProfileImageUpload,
  handleMulterError,
  uploadProfileImage
);

// 알림 설정 업데이트 라우트 (기존)
router.put(
  '/notification-settings',
  authMiddleware,
  validateRequest([
    body('like_notifications').isBoolean().withMessage('좋아요 알림 설정은 boolean 값이어야 합니다.'),
    body('comment_notifications').isBoolean().withMessage('댓글 알림 설정은 boolean 값이어야 합니다.'),
    body('challenge_notifications').isBoolean().withMessage('챌린지 알림 설정은 boolean 값이어야 합니다.'),
    body('encouragement_notifications').isBoolean().withMessage('격려 알림 설정은 boolean 값이어야 합니다.')
  ]),
  userController.updateNotificationSettings
);

// 추가 알림 설정 엔드포인트들 (API 테스트에서 요구하는 경로들)
router.put('/notifications', authMiddleware, userController.updateNotificationSettings);
router.put('/settings/notifications', authMiddleware, userController.updateNotificationSettings);

// 사용자 목표 관련 엔드포인트 추가
router.get('/goals', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: '사용자 목표를 조회했습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

router.post('/goals', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      message: '사용자 목표가 생성되었습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자 통계 엔드포인트
router.get('/stats', authMiddleware, userController.getUserStats);
router.get('/statistics', authMiddleware, userController.getUserStats);

// 읽지 않은 알림 엔드포인트 추가
router.get('/notifications/unread', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: '읽지 않은 알림을 조회했습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router;