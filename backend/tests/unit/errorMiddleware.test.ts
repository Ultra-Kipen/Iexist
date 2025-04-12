// /backend/tests/unit/errorMiddleware.test.ts
import { Request, Response, NextFunction } from 'express';
import errorHandler from '../../middleware/errorMiddleware';

describe('Error Middleware 테스트', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  it('기본 에러의 경우 상태 코드 500을 반환해야 함', () => {
    const error = new Error('테스트 에러 메시지');
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '테스트 에러 메시지'
      })
    );
  });

  it('statusCode가 있는 에러의 경우 해당 상태 코드를 반환해야 함', () => {
    const error: any = new Error('리소스를 찾을 수 없습니다.');
    error.statusCode = 404;
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '리소스를 찾을 수 없습니다.'
      })
    );
  });

  it('개발 환경에서는 스택 트레이스를 포함해야 함', () => {
    // 기존 NODE_ENV 저장
    const originalNodeEnv = process.env.NODE_ENV;
    // 개발 환경으로 설정
    process.env.NODE_ENV = 'development';
    
    const error = new Error('개발 환경 에러');
    error.stack = 'Error: 개발 환경 에러\n    at Test';
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '개발 환경 에러',
        stack: expect.stringContaining('Error: 개발 환경 에러')
      })
    );
    
    // NODE_ENV 복원
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('프로덕션 환경에서는 스택 트레이스를 포함하지 않아야 함', () => {
    // 기존 NODE_ENV 저장
    const originalNodeEnv = process.env.NODE_ENV;
    // 프로덕션 환경으로 설정
    process.env.NODE_ENV = 'production';
    
    const error = new Error('프로덕션 환경 에러');
    error.stack = 'Error: 프로덕션 환경 에러\n    at Test';
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: '프로덕션 환경 에러',
      stack: null
    });
    
    // NODE_ENV 복원
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('여러 오류 유형을 적절히 처리해야 함', () => {
    // TypeError
    const typeError: any = new TypeError('타입 에러가 발생했습니다.');
    errorHandler(typeError, mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '타입 에러가 발생했습니다.'
      })
    );

    // 커스텀 에러 (400 Bad Request)
    const badRequestError: any = new Error('잘못된 요청입니다.');
    badRequestError.statusCode = 400;
    errorHandler(badRequestError, mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '잘못된 요청입니다.'
      })
    );

    // 커스텀 에러 (403 Forbidden)
    const forbiddenError: any = new Error('접근 권한이 없습니다.');
    forbiddenError.statusCode = 403;
    errorHandler(forbiddenError, mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '접근 권한이 없습니다.'
      })
    );
  });
});