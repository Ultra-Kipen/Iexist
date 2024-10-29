import { Router } from 'express';
import { validateRequest } from '../middleware/validationMiddleware';
import { body } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware';
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models';
import { AuthRequest } from '../types/express';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ProfileUpdateRequest {
  nickname?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  favorite_quote?: string;
}

const router = Router();

// 컨트롤러 함수들을 라우터 파일 내에서 정의
const userController = {
  register: async (req: AuthRequest<RegisterRequest>, res: Response) => {
    try {
      const { username, email, password, nickname } = req.body;

      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await db.User.create({
        username,
        email,
        password_hash: hashedPassword,
        nickname: nickname || username,
        theme_preference: 'light'
      });

      const token = jwt.sign(
        { userId: newUser.user_id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: '회원가입이 완료되었습니다.',
        token,
        user: {
          id: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          nickname: newUser.nickname
        }
      });
    } catch (error) {
      console.error('회원가입 오류:', error);
      res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
    }
  },

  // 로그인
  login: async (req: AuthRequest<LoginRequest>, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await db.User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }

      const token = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: '로그인 성공',
        token,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          nickname: user.nickname
        }
      });
    } catch (error) {
      console.error('로그인 오류:', error);
      res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
    }
  },

  // 프로필 조회
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const user = await db.User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      res.json(user);
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      res.status(500).json({ message: '프로필 조회 중 오류가 발생했습니다.' });
    }
  },

  // 프로필 수정
  updateProfile: async (req: AuthRequest<ProfileUpdateRequest>, res: Response) => {
    try {
      const userId = req.user?.id;
      const { nickname, theme_preference, favorite_quote } = req.body;

      await db.User.update(
        { nickname, theme_preference, favorite_quote },
        { where: { user_id: userId } }
      );

      res.json({ message: '프로필이 성공적으로 수정되었습니다.' });
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      res.status(500).json({ message: '프로필 수정 중 오류가 발생했습니다.' });
    }
  }
};

// 라우트 정의
router.post('/register',
  validateRequest([
    body('username').notEmpty().withMessage('사용자 이름은 필수입니다.'),
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
  ]),
  userController.register
);

router.post('/login',
  validateRequest([
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요.')
  ]),
  userController.login
);

router.get('/profile', authMiddleware, userController.getProfile);

router.put('/profile',
  authMiddleware,
  validateRequest([
    body('nickname').optional().isLength({ min: 2, max: 50 })
      .withMessage('닉네임은 2자 이상 50자 이하여야 합니다.'),
    body('theme_preference').optional().isIn(['light', 'dark', 'system'])
      .withMessage('유효하지 않은 테마 설정입니다.')
  ]),
  userController.updateProfile
);

export default router;