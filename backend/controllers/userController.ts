import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { JWT_SECRET } from '../config';

class UserController {
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // 이메일 중복 확인
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '이미 사용 중인 이메일입니다.'
        });
      }

      // 비밀번호 해시화
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 사용자 생성
      const user = await User.create({
        username,
        email,
        password: hashedPassword
      });

      // JWT 토큰 생성
      const token = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        }
      });

    } catch (error) {
      console.error('사용자 등록 오류:', error);
      return res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다.'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 사용자 찾기
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        }
      });

    } catch (error) {
      console.error('로그인 오류:', error);
      return res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다.'
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'nickname', 'theme_preference']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      return res.json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('프로필 조회 오류:', error);
      return res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다.'
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const { nickname, theme_preference } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      await user.update({
        nickname,
        theme_preference
      });

      return res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          theme_preference: user.theme_preference
        }
      });

    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      return res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다.'
      });
    }
  }
}

export default new UserController();