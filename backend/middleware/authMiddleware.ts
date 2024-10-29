import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/express';
import { User } from '../models';

interface JwtPayload {
  userId: number;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 제공되지 않았습니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }

    req.user = {
      id: user.user_id,
      username: user.username,
      email: user.email
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: '토큰이 만료되었습니다. 다시 로그인해주세요.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
    console.error('인증 미들웨어 오류:', error);
    next(error);
  }
};

export default authMiddleware;
