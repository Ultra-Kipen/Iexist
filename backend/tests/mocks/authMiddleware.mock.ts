// tests/mocks/authMiddleware.mock.ts
import { NextFunction, Request, Response } from 'express';

// 테스트용 모의 사용자
const testUsers = new Map();

// 모의 사용자 등록 함수
export const registerTestUser = (userId: number, userData: any) => {
  testUsers.set(userId, userData);
};

// 테스트 환경에서 사용할 인증 미들웨어
const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 테스트 요청에 항상 기본 사용자 인증 추가
  (req as any).user = {
    user_id: 1,
    email: 'test@example.com',
    nickname: 'TestUser',
    is_active: true
  };
  
  next();
};

export default mockAuthMiddleware;