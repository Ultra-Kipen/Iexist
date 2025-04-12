// tests/rateLimit.test.ts
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import request from 'supertest';

describe('속도 제한 미들웨어 테스트', () => {
  const app = express();
  
  // 테스트용 비율 제한 미들웨어 생성
  const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 5, // 테스트에서는 매우 낮은 값으로 설정
    standardHeaders: true,
    legacyHeaders: true,
    skipSuccessfulRequests: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        status: 'error',
        message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    }
  });
  
  // 속도 제한 미들웨어 적용
  app.use('/api/limited', testLimiter);
  
  // 테스트 엔드포인트
  app.get('/api/limited/test', (req: Request, res: Response) => {
    res.status(200).json({ message: '성공' });
  });
  
  // 속도 제한이 없는 엔드포인트
  app.get('/api/unlimited/test', (req: Request, res: Response) => {
    res.status(200).json({ message: '성공' });
  });

  it('속도 제한에 도달하면 429 상태 코드를 반환해야 함', async () => {
    // 각 테스트에 독립적인 새로운 Express 인스턴스
    const testApp = express();
    
    // 테스트용 속도 제한 미들웨어(매우 낮은 제한)
    const strictLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: true,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          status: 'error',
          message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
      }
    });
    
    testApp.use('/api/limited', strictLimiter);
    testApp.get('/api/limited/test', (req: Request, res: Response) => {
      res.status(200).json({ message: '성공' });
    });
    
    // 속도 제한 이내의 요청
    for (let i = 0; i < 5; i++) {
      const response = await request(testApp).get('/api/limited/test');
      expect(response.status).toBe(200);
    }
    
    // 속도 제한 초과 요청
    const limitExceededResponse = await request(testApp).get('/api/limited/test');
    expect(limitExceededResponse.status).toBe(429);
    expect(limitExceededResponse.body).toHaveProperty('message');
    expect(limitExceededResponse.body.message).toContain('너무 많은 요청');
  });

  it('속도 제한 헤더가 응답에 포함되어야 함', async () => {
    const response = await request(app).get('/api/limited/test');
    
    // 속도 제한 관련 헤더 확인
    expect(response.headers).toHaveProperty('x-ratelimit-limit');
    expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    expect(response.headers).toHaveProperty('x-ratelimit-reset');
  });

  it('속도 제한이 없는 라우트는 제한 없이 접근 가능해야 함', async () => {
    // 여러 번 요청해도 성공해야 함
    for (let i = 0; i < 10; i++) {
      const response = await request(app).get('/api/unlimited/test');
      expect(response.status).toBe(200);
    }
  });
});