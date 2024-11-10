import request from 'supertest';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from '../middleware/corsMiddleware';
import { apiLimiter } from '../middleware/rateLimitMiddleware';
import { configSecurity } from '../middleware/securityMiddleware';
import config from '../config/config';

// 테스트용 앱과 실제 앱을 분리
const createApp = (useRateLimit: boolean = true) => {
  const app = express();

  // 기본 미들웨어
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 보안 미들웨어
  configSecurity(app);
  app.use(corsMiddleware);
  
  // rate limit은 조건부로 적용
  if (useRateLimit) {
    app.use(apiLimiter);
  }

  // 테스트 라우트
  app.get('/api/users/profile', (req: Request, res: Response) => {
    res.json({ message: 'Profile data' });
  });

  // 로그인 라우트
  app.post('/api/auth/login', (req: Request, res: Response) => {
    res.cookie('auth', 'test-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful'
    });
  });

  return app;
};

describe('Security Middleware Tests', () => {
  // rate limit 테스트용 앱
  const appWithRateLimit = createApp(true);
  // 다른 보안 테스트용 앱 (rate limit 제외)
  const appWithoutRateLimit = createApp(false);

  it('should limit repeated requests', async () => {
    for (let i = 0; i < 100; i++) {
      await request(appWithRateLimit).get('/api/users/profile');
    }
    const response = await request(appWithRateLimit).get('/api/users/profile');
    expect(response.status).toBe(429);
  });

  it('should handle CORS', async () => {
    const response = await request(appWithoutRateLimit)
      .get('/api/users/profile')
      .set('Origin', 'http://unauthorized-domain.com');
    expect(response.status).toBe(403);
  });

  it('should set security headers', async () => {
    const response = await request(appWithoutRateLimit).get('/api/users/profile');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should set CSP headers', async () => {
    const response = await request(appWithoutRateLimit).get('/api/users/profile');
    expect(response.headers['content-security-policy']).toBeDefined();
  });

  it('should set HSTS header', async () => {
    const response = await request(appWithoutRateLimit).get('/api/users/profile');
    expect(response.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });

  it('should set secure cookie attributes', async () => {
    const response = await request(appWithoutRateLimit)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        username: 'test',
        password: 'test'
      });

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();

    const cookies = response.headers['set-cookie'];
    expect(Array.isArray(cookies)).toBe(true);

    const authCookie = cookies[0];
    expect(authCookie).toMatch(/auth=/);
    expect(authCookie).toMatch(/HttpOnly/);
    expect(authCookie).toMatch(/SameSite=Strict/);
    expect(authCookie).toMatch(/Path=\//);

    if (process.env.NODE_ENV === 'production') {
      expect(authCookie).toMatch(/Secure/);
    }
  });
});