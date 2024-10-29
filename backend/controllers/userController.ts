import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { JWT_SECRET } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

class UserController {
  async register(req: Request, res: Response) {
    try {
      const { username, email, password, nickname } = req.body;

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
        password: hashedPassword,
        nickname
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
            email: user.email,
            nickname: user.nickname
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
      const user = await User.findOne({ 
        where: { email },
        attributes: ['id', 'username', 'email', 'password', 'nickname'] 
      });
      
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
            email: user.email,
            nickname: user.nickname
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

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      // 최신 사용자 정보 조회
      const updatedUser = await User.findByPk(user.id, {
        attributes: ['id', 'username', 'email', 'nickname', 'theme_preference']
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      return res.json({
        success: true,
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          nickname: updatedUser.nickname,
          theme_preference: updatedUser.theme_preference
        }
      });

    } catch (error) {
      console.error('프로필 조회 오류:', error);
      return res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다.'
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const { nickname, theme_preference } = req.body;

      const updatedUser = await User.findByPk(user.id);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      await updatedUser.update({
        nickname,
        theme_preference
      });

      return res.json({
        success: true,
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          nickname: updatedUser.nickname,
          theme_preference: updatedUser.theme_preference
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