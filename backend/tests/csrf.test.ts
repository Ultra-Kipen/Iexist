// tests/csrf.test.ts
import request from 'supertest';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { configSecurity } from '../middleware/securityMiddleware';

describe('CSRF 보호 테스트', () => {
  const app = express();
  
  // 필수 미들웨어
  app.use(express.json());
  app.use(cookieParser());
  configSecurity(app);
  
  // 로그인 시뮬레이션
  app.post('/api/auth/login', (req: Request, res: Response) => {
    res.cookie('session', 'test-session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.status(200).json({ message: '로그인 성공' });
  });
  
  // 민감한 작업을 수행하는 API
  app.post('/api/profile/update', (req: Request, res: Response) => {
    // 요청 원본 확인
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || '';
    
    // 단순화된 CSRF 검사 - 실제로는 CSRF 토큰을 사용해야 함
    if (!origin || !referer) {
      return res.status(403).json({ message: 'CSRF 보호: 원본 헤더가 없습니다.' });
    }
    
    res.status(200).json({ message: '프로필이 업데이트되었습니다.' });
  });

  it('보호된 라우트는 올바른 Origin 헤더가 필요함', async () => {
    // 먼저 로그인
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' });
    
    expect(loginResponse.status).toBe(200);
    
    // 쿠키 추출
    const cookies = loginResponse.headers['set-cookie'];
    
    // Origin 헤더 없이 요청 시도
    const noOriginResponse = await request(app)
      .post('/api/profile/update')
      .set('Cookie', cookies)
      .send({ name: 'New Name' });
    
    expect(noOriginResponse.status).toBe(403);
    
    // 올바른 Origin 헤더로 요청
    const withOriginResponse = await request(app)
      .post('/api/profile/update')
      .set('Cookie', cookies)
      .set('Origin', 'http://localhost:3000')
      .set('Referer', 'http://localhost:3000/profile')
      .send({ name: 'New Name' });
    
    expect(withOriginResponse.status).toBe(200);
  });

  it('쿠키에 보안 속성이 설정되어야 함', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' });
    
    expect(response.status).toBe(200);
    
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('HttpOnly');
    expect(cookies[0]).toContain('SameSite=Strict');
    
    // 프로덕션 환경에서는 Secure 속성도 설정되어야 함
    if (process.env.NODE_ENV === 'production') {
      expect(cookies[0]).toContain('Secure');
    }
  });
});