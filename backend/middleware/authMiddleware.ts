import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthRequest } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '유효하지 않은 인증 토큰입니다.'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { user_id: number };
      const user = await User.findByPk(decoded.user_id, {
        attributes: ['user_id', 'username', 'email', 'nickname', 'is_active']
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      if (!user.get('is_active')) {
        return res.status(401).json({
          status: 'error',
          message: '비활성화된 계정입니다.'
        });
      }

      req.user = user.get();
      next();
      
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: '유효하지 않은 인증 토큰입니다.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

export default authMiddleware;