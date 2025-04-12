import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import request from 'supertest';
import { corsMiddleware } from '../middleware/corsMiddleware';
import { configSecurity } from '../middleware/securityMiddleware';

// 테스트용 rate limit 설정하기 위한 환경 변수
const originalTestRateLimit = process.env.TEST_RATE_LIMIT;
process.env.TEST_RATE_LIMIT = 'true';

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
  
  // rate limit은 조건부로 적용 - 직접 생성
  if (useRateLimit) {
    // 테스트용 rate limiter - 매우 작은 한계값 설정
    const testLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5, // 매우 작은 한계값
      message: {
        status: 'error',
        message: '너무 많은 요청이 발생했습니다.'
      },
      standardHeaders: true,
      legacyHeaders: true,
      skipSuccessfulRequests: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          status: 'error',
          message: '너무 많은 요청이 발생했습니다.'
        });
      }
    });
    app.use(testLimiter);
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
    // 많은 요청을 보내서 rate limit에 도달하게 함 - 10개만 해도 충분
    for (let i = 0; i < 10; i++) {
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

  // 테스트 후 원래 환경 변수 복원
   // 테스트 후 원래 환경 변수 복원
   afterAll(() => {
    process.env.TEST_RATE_LIMIT = originalTestRateLimit;
  });
});