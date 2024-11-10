import { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
// xss-clean은 CommonJS 모듈이므로 require 사용
const xssClean = require('xss-clean');

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
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' }
  }));

  // XSS 공격 방지
  app.use(xssClean());

  // HTTP Parameter Pollution 방지
  app.use(hpp());

  // Cookie Parser
  app.use(cookieParser());

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