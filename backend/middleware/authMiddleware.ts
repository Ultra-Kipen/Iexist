import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { JWT_SECRET } from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 인증 토큰입니다.'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'username', 'email']
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 인증 토큰입니다.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    });
  }
};

export default authMiddleware;