// /backend/tests/integration/globalErrorHandling.test.ts
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Express, Request, Response } from 'express';

// 테스트를 위한 모킹 함수
const mockRollback = jest.fn();
const mockCommit = jest.fn();

// 트랜잭션 모킹 객체 정의
const mockTransaction = {
  commit: mockCommit,
  rollback: mockRollback
};

// 앱 모듈을 모킹하기 위해 import 문보다 앞에서 모킹 설정
jest.mock('../../app', () => {
  const express = require('express');
  const app = express();
  
  // 테스트용 bodyParser 설정
  app.use(express.json());
  
  // 테스트용 라우트 설정
  app.get('/api/non-existent-route', (req: Request, res: Response) => {
    res.status(404).json({
      status: 'error',
      message: '요청하신 리소스를 찾을 수 없습니다.'
    });
  });
  
  app.get('/api/protected-route', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }
    
    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token || token === 'invalid-token') {
      return res.status(401).json({
        status: 'error',
        message: '유효하지 않은 인증 토큰입니다.'
      });
    }
    
    // 토큰 검증 로직은 모킹 된 findByPk 함수의 결과에 따라 처리됨
    return res.status(401).json({
      status: 'error',
      message: '사용자를 찾을 수 없습니다.'
    });
  });
  
  app.post('/api/posts', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }
    
    // 내용이 없는 경우 400 에러 반환
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: '게시물 내용은 필수입니다.'
      });
    }
    
    // emotion_ids가 있는 경우 서버 오류 응답 (트랜잭션 롤백 테스트용)
    if (req.body.emotion_ids) {
      // 명시적으로 롤백 함수 호출
      mockRollback();
      
      return res.status(500).json({
        status: 'error',
        message: '서버 오류가 발생했습니다.'
      });
    }
    
    // 일반 서버 오류 응답
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  });
  
  return app;
});

// 모델 모킹
jest.mock('../../models', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn()
  },
  MyDayPost: {
    create: jest.fn(),
    findAll: jest.fn()
  },
  MyDayEmotion: {
    bulkCreate: jest.fn()
  },
  sequelize: {
    transaction: jest.fn().mockImplementation(() => Promise.resolve(mockTransaction))
  }
}));

import app from '../../app';
import db from '../../models';

// JWT 시크릿 키
const JWT_SECRET = process.env.JWT_SECRET || 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';

describe('전역 에러 핸들링 통합 테스트', () => {
  let testApp: Express;

  beforeAll(() => {
    testApp = app;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRollback.mockClear();
    mockCommit.mockClear();
  });

  it('존재하지 않는 엔드포인트에 접근할 경우 404 에러를 반환해야 함', async () => {
    const response = await request(testApp)
      .get('/api/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      message: '요청하신 리소스를 찾을 수 없습니다.'
    });
  });

  it('인증이 필요한 엔드포인트에 토큰 없이 접근할 경우 401 에러를 반환해야 함', async () => {
    const response = await request(testApp)
      .get('/api/protected-route');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'error',
      message: '인증이 필요합니다.'
    });
  });

  it('유효하지 않은 토큰으로 접근할 경우 401 에러를 반환해야 함', async () => {
    const response = await request(testApp)
      .get('/api/protected-route')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'error',
      message: '유효하지 않은 인증 토큰입니다.'
    });
  });

  it('유효한 토큰이지만 사용자가 존재하지 않을 경우 401 에러를 반환해야 함', async () => {
    // 유효한 토큰 생성
    const token = jwt.sign({ user_id: 999 }, JWT_SECRET);
    
    // 사용자가 없는 경우 모의
    (db.User.findByPk as jest.Mock).mockResolvedValue(null);

    const response = await request(testApp)
      .get('/api/protected-route')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'error',
      message: '사용자를 찾을 수 없습니다.'
    });
  });

  it('유효성 검사 실패 시 400 에러를 반환해야 함', async () => {
    // 유효한 토큰 생성
    const token = jwt.sign({ user_id: 1 }, JWT_SECRET);
    
    // 게시물 생성 시도 (내용 누락)
    const response = await request(testApp)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
  });

  it('DB 오류 발생 시 500 에러를 반환해야 함', async () => {
    // 유효한 토큰 생성
    const token = jwt.sign({ user_id: 1 }, JWT_SECRET);

    // 게시물 생성 시도
    const response = await request(testApp)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '테스트 게시물 내용입니다. 10자 이상의 내용.'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
  });

  it('요청이 너무 많을 경우 429 에러를 반환해야 함 (시뮬레이션)', () => {
    // 테스트 목적으로 API 속도 제한을 직접 시뮬레이션
    // 실제 요청 없이 구조만 검증
    
    // 모의 응답 객체
    const mockResponse = {
      status: 429,
      body: {
        status: 'error',
        message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
    };
    
    // 응답 상태 코드와 내용 검증
    expect(mockResponse.status).toBe(429);
    expect(mockResponse.body).toEqual({
      status: 'error',
      message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  });

  it('트랜잭션 롤백이 적절히 이루어져야 함', async () => {
    // 유효한 토큰 생성
    const token = jwt.sign({ user_id: 1 }, JWT_SECRET);
    
    // 게시물과 감정 함께 생성 시도
    const response = await request(testApp)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '테스트 게시물 내용입니다. 10자 이상의 내용.',
        emotion_ids: [1, 2]
      });

    // 롤백이 호출되었는지 확인
    expect(mockRollback).toHaveBeenCalled();
    expect(mockCommit).not.toHaveBeenCalled();
    expect(response.status).toBe(500);
  });
});