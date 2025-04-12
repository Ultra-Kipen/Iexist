// rateLimitMiddleware.ts
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  // TEST_RATE_LIMIT이 설정되었을 때는 더 작은 제한(50)을 사용
  max: process.env.TEST_RATE_LIMIT === 'true' ? 50 : 1000,
  message: {
    status: 'error',
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: true, // x-ratelimit-* 헤더를 설정하도록 변경
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      status: 'error',
      message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});