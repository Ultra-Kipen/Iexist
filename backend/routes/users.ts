import { Router } from 'express';
import { validateRequest, body } from '../middleware/validationMiddleware';
import authMiddleware from '../middleware/authMiddleware';
import userController from '../controllers/userController';

const router = Router();

// 회원가입
router.post('/register',
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
router.post('/login',
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

router.get('/profile', authMiddleware, userController.getProfile);

// 프로필 업데이트
router.put('/profile',
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

export default router;