import cors from 'cors';
import { NextFunction, Request, Response } from 'express';

// CORS 설정
export const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
});

// 최대한 단순화된 CORS 에러 핸들러
export const corsErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // 바로 다음 에러 핸들러로 전달
  next(err);
};