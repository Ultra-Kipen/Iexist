import { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

export const configSecurity = (app: Application): void => {
  // 기본 보안 헤더 설정
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    xssFilter: true,  // XSS 필터 활성화
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' }
  }));

  // HTTP Parameter Pollution 방지
  app.use(hpp());

  // Cookie Parser
  app.use(cookieParser());

  // 추가적인 XSS 방어 미들웨어
  app.use((req: Request, res: Response, next: NextFunction) => {
    // 입력값 검증 로직 (예시)
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          // 기본적인 HTML 태그 제거
          req.body[key] = req.body[key].replace(/<[^>]*>/g, '');
        }
      }
    }
    next();
  });

  // 보안 관련 응답 헤더 설정
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // 에러 핸들러
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }
    next(err);
  });
};