// middleware/authMiddleware.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../models';  // db import 추가
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

    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({
        status: 'error',
        message: '유효하지 않은 인증 토큰입니다.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { user_id: number };
    
    // db.User로 변경
    const user = await db.User.findOne({
      where: { user_id: decoded.user_id },
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
    
    req.user = {
      user_id: user.get('user_id'),
      email: user.get('email'), 
      nickname: user.get('nickname'),
      is_active: user.get('is_active')
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 'error',
        message: '유효하지 않은 인증 토큰입니다.'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

export default authMiddleware;