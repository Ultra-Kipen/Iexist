import { Request, Response, NextFunction } from 'express';

interface ErrorResponse extends Error {
  statusCode?: number;
}

const errorHandler = (err: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export default errorHandler;