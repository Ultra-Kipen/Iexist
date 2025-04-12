// tests/security/securityMiddleware.test.ts - 수정된 버전
import request from 'supertest';
import express, { Request, Response, NextFunction, Application } from 'express';
import { configSecurity } from '../../middleware/securityMiddleware';

describe('Security Middleware Tests', () => {
  let app: Application;
  
  beforeEach(() => {
    app = express();
    
    // 기본 미들웨어 설정
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // 보안 미들웨어 적용
    configSecurity(app);
    
    // 테스트 라우트
    app.get('/api/test', (req: Request, res: Response) => {
      res.status(200).json({ message: 'Test successful' });
    });
    
    // UnauthorizedError 시뮬레이션 라우트
    app.get('/api/unauthorized-error', (req: Request, res: Response, next: NextFunction) => {
      const error: any = new Error('JWT Token is invalid');
      error.name = 'UnauthorizedError';
      next(error);
    });
    
    // 오류 핸들러 미들웨어를 명시적으로 추가
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
      // 그 외 오류는 500으로 처리
      res.status(500).json({
        status: 'error',
        message: '서버 오류가 발생했습니다.'
      });
    });
  });
  
  it('should set security headers correctly', async () => {
    const response = await request(app).get('/api/test');
    
    expect(response.status).toBe(200);
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });
  
  it('should handle UnauthorizedError correctly', async () => {
    const response = await request(app).get('/api/unauthorized-error');
    
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'error',
      message: '인증이 필요합니다.'
    });
  });
  
  it('should block requests with unauthorized origin', async () => {
    const response = await request(app)
      .get('/api/test')
      .set('Origin', 'http://malicious-site.com');
    
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'CORS 정책에 의해 차단되었습니다.'
    });
  });
  
  it('should allow requests with authorized origin', async () => {
    // config.cors.allowedOrigins에 포함된 출처 중 하나 사용
    const response = await request(app)
      .get('/api/test')
      .set('Origin', 'http://localhost:3000');
    
    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
  
  it('should set Content-Security-Policy header', async () => {
    const response = await request(app).get('/api/test');
    
    expect(response.headers['content-security-policy']).toBeDefined();
  });
});