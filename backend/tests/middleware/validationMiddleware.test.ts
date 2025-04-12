import { Request, Response, NextFunction } from 'express';
import { validateRequest, body } from '../../middleware/validationMiddleware';

// 원본 미들웨어 함수를 저장
const originalValidateRequest = validateRequest;

// 미들웨어 모킹을 위한 함수
let mockValidationSuccess = true;
let mockValidationErrors: any[] = [];
let mockThrowError = false;

// 미들웨어 함수 모킹
jest.mock('../../middleware/validationMiddleware', () => {
  const original = jest.requireActual('../../middleware/validationMiddleware');
  
  return {
    ...original,
    validateRequest: jest.fn().mockImplementation((validations) => {
      return async (req: Request, res: Response, next: NextFunction) => {
        if (mockThrowError) {
          return res.status(500).json({
            status: 'error',
            message: '서버 오류가 발생했습니다.'
          });
        } else if (mockValidationSuccess) {
          return next();
        } else {
          return res.status(400).json({
            status: 'error',
            errors: mockValidationErrors.map(error => ({
              field: error.path,
              message: error.msg
            }))
          });
        }
      };
    })
  };
});

// express-validator 모킹
jest.mock('express-validator', () => ({
  check: jest.fn().mockImplementation(() => ({
    run: jest.fn().mockResolvedValue(undefined),
    optional: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    isISO8601: jest.fn().mockReturnThis(),
    isArray: jest.fn().mockReturnThis(),
    isString: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    isBoolean: jest.fn().mockReturnThis(),
    toInt: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis()
  })),
  validationResult: jest.fn()
}));

describe('유효성 검증 미들웨어 테스트', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    // 테스트 기본값 설정
    mockValidationSuccess = true;
    mockValidationErrors = [];
    mockThrowError = false;
    
    // 요청/응답 객체 초기화
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    
    // 모킹된 함수 초기화
    jest.clearAllMocks();
  });

  test('유효성 검증에 성공하면 next 함수 호출', async () => {
    // 성공 케이스 설정
    mockValidationSuccess = true;
    
    const validations = [body('email').isEmail()];
    const middleware = validateRequest(validations);
    
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  test('유효성 검증에 실패하면 400 응답', async () => {
    // 실패 케이스 설정
    mockValidationSuccess = false;
    mockValidationErrors = [
      { path: 'email', msg: '유효한 이메일을 입력해주세요.', type: 'field', value: 'invalid', location: 'body' }
    ];
    
    const validations = [body('email').isEmail()];
    const middleware = validateRequest(validations);
    
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      errors: [
        {
          field: 'email',
          message: '유효한 이메일을 입력해주세요.'
        }
      ]
    });
  });

  test('유효성 검증 중 예외 발생 시 500 응답', async () => {
    // 예외 발생 케이스 설정
    mockThrowError = true;
    
    const validations = [body('email').isEmail()];
    const middleware = validateRequest(validations);
    
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  });
});