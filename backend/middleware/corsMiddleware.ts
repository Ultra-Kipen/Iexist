import { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import config from '../config/config';

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

// CORS 에러 핸들러
export const corsErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'CORS 정책에 의해 차단되었습니다.') {
    return res.status(403).json({
      status: 'error',
      message: err.message
    });
  }
  next(err);
};