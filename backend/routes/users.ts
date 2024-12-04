import { Router } from 'express';
import { validateRequest } from '../middleware/validationMiddleware';
import authMiddleware from '../middleware/authMiddleware';
import userController from '../controllers/userController';
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
// 프로필 조회 
router.get('/profile', authMiddleware, userController.getProfile);

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

// 알림 설정 업데이트 라우트 추가
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
  export default router;