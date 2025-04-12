// tests/loggingMonitoring.test.ts
import { Request, Response, NextFunction } from 'express';

// winston 모듈 대신 간단한 로거 인터페이스 정의
interface Logger {
  info(message: any): void;
  error(message: any): void;
  warn(message: any): void;
}

// 테스트를 위한 로거 생성
const testLogger: Logger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// 로깅 서비스 모듈 모킹
class LoggingService {
  static logRequest(req: Request, res: Response, duration: number) {
    testLogger.info({
      type: 'request',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    return true;
  }

  static logError(req: Request, err: Error) {
    testLogger.error({
      type: 'error',
      method: req.method,
      url: req.originalUrl,
      error: err.message,
      stack: err.stack,
      ip: req.ip
    });
    return true;
  }

  static logSecurityEvent(req: Request, eventType: string, details: any) {
    testLogger.warn({
      type: 'security',
      eventType,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      details
    });
    return true;
  }

  static logUserActivity(req: Request, userId: number, activity: string) {
    testLogger.info({
      type: 'userActivity',
      userId,
      activity,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
    return true;
  }

  static logPerformance(metric: string, value: number, tags: Record<string, string> = {}) {
    testLogger.info({
      type: 'performance',
      metric,
      value,
      tags
    });
    return true;
  }
}

// 에러 처리 미들웨어
function errorLoggingMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  LoggingService.logError(req, err);
  next(err);
}

// 요청 로깅 미들웨어
function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    LoggingService.logRequest(req, res, duration);
  });

  next();
}

// 보안 로깅 미들웨어
function securityLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  // 보안 이벤트 감지 로직 (예: 신뢰할 수 없는 IP, 의심스러운 요청 패턴)
  const suspiciousIPs = ['1.2.3.4', '5.6.7.8']; // 예시
  
  if (suspiciousIPs.includes(req.ip || '')) {
    LoggingService.logSecurityEvent(req, 'suspiciousIP', { ip: req.ip });
  }
  
  // 인증 실패 횟수가 많은 IP 감지 (예시)
  const failedAuthCount = req.headers['x-failed-auth-count'];
  if (failedAuthCount && Number(failedAuthCount) > 5) {
    LoggingService.logSecurityEvent(req, 'authFailure', { 
      count: failedAuthCount,
      ip: req.ip
    });
  }

  next();
}

// 사용자 활동 로깅 미들웨어
function userActivityLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  // 사용자 ID가 요청에 있다고 가정
  const userId = (req as any).user?.user_id;
  
  if (userId) {
    // 중요 활동 목록 (예시)
    const importantPaths = [
      { path: '/api/users/password', activity: '비밀번호 변경' },
      { path: '/api/users/profile', activity: '프로필 업데이트' },
      { path: '/api/challenges/create', activity: '챌린지 생성' },
      { path: '/api/my-day/posts', activity: '게시물 작성' }
    ];
    
    const matchedPath = importantPaths.find(item => 
      req.originalUrl.includes(item.path) && req.method !== 'GET'
    );
    
    if (matchedPath) {
      LoggingService.logUserActivity(req, userId, matchedPath.activity);
    }
  }
  
  next();
}

describe('로깅 및 모니터링 테스트', () => {
  // 테스트용 모의 객체들
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  
  // 로깅 서비스 스파이
  let logRequestSpy: jest.SpyInstance;
  let logErrorSpy: jest.SpyInstance;
  let logSecurityEventSpy: jest.SpyInstance;
  let logUserActivitySpy: jest.SpyInstance;
  let logPerformanceSpy: jest.SpyInstance;

  beforeEach(() => {
    // 로깅 서비스 메소드 스파이 설정
    logRequestSpy = jest.spyOn(LoggingService, 'logRequest');
    logErrorSpy = jest.spyOn(LoggingService, 'logError');
    logSecurityEventSpy = jest.spyOn(LoggingService, 'logSecurityEvent');
    logUserActivitySpy = jest.spyOn(LoggingService, 'logUserActivity');
    logPerformanceSpy = jest.spyOn(LoggingService, 'logPerformance');

    // 요청 모의화
    mockRequest = {
      method: 'POST',
      originalUrl: '/api/users/profile',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'jest-test-agent'
      } as Record<string, string | string[] | undefined>
    };

    // 사용자 정보 추가 - type assertion을 사용하여 타입 오류 해결
    (mockRequest as any).user = {
      user_id: 123,
      email: 'test@example.com',
      nickname: 'testuser',
      is_active: true
    };

    // 응답 모의화
    mockResponse = {
      statusCode: 200,
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          // finish 이벤트를 즉시 호출하여 테스트
          callback();
        }
        return mockResponse;
      })
    };

    // next 함수 모의화
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('오류 발생 시 로깅 검증', () => {
    test('에러 미들웨어가 오류를 올바르게 로깅해야 함', () => {
      // 테스트용 오류 생성
      const testError = new Error('테스트 오류 메시지');
      
      // 에러 미들웨어 호출
      errorLoggingMiddleware(testError, mockRequest as Request, mockResponse as Response, nextFunction);
      
      // 오류 로깅 함수가 호출되었는지 확인
      expect(logErrorSpy).toHaveBeenCalledTimes(1);
      expect(logErrorSpy).toHaveBeenCalledWith(mockRequest, testError);
      
      // next 함수가 오류와 함께 호출되었는지 확인
      expect(nextFunction).toHaveBeenCalledWith(testError);
    });
    
    test('오류 객체에 스택 트레이스가 포함되어야 함', () => {
      // 스택 트레이스가 있는 오류 생성
      const testError = new Error('스택 트레이스 테스트');
      
      // 에러 미들웨어 호출
      errorLoggingMiddleware(testError, mockRequest as Request, mockResponse as Response, nextFunction);
      
      // 로깅 함수에 스택 트레이스가 전달되었는지 확인
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          stack: expect.any(String)
        })
      );
    });
  });
  
  describe('중요 이벤트 추적 및 로깅 검증', () => {
    test('사용자 활동 미들웨어가 중요 활동을 로깅해야 함', () => {
      // 사용자 활동 미들웨어 호출
      userActivityLoggingMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // 사용자 활동 로깅 함수가 호출되었는지 확인
      expect(logUserActivitySpy).toHaveBeenCalledTimes(1);
      expect(logUserActivitySpy).toHaveBeenCalledWith(
        mockRequest,
        123, // 사용자 ID
        '프로필 업데이트' // 활동 유형
      );
      
      // next 함수가 호출되었는지 확인
      expect(nextFunction).toHaveBeenCalled();
    });
    
    test('불필요한 경로에서는 사용자 활동 로깅이 호출되지 않아야 함', () => {
      // 중요하지 않은 경로로 요청 설정 (read-only 속성 대신 새 객체 생성)
      mockRequest = {
        ...mockRequest,
        method: 'GET',
        originalUrl: '/api/emotions'
      };
      
      (mockRequest as any).user = {
        user_id: 123,
        email: 'test@example.com',
        nickname: 'testuser',
        is_active: true
      };
      
      // 사용자 활동 미들웨어 호출
      userActivityLoggingMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // 사용자 활동 로깅 함수가 호출되지 않았는지 확인
      expect(logUserActivitySpy).not.toHaveBeenCalled();
      
      // next 함수가 호출되었는지 확인
      expect(nextFunction).toHaveBeenCalled();
    });
  });
  
  describe('성능 모니터링 로깅', () => {
    test('요청 로깅 미들웨어가 응답 시간을 로깅해야 함', () => {
      // 시간 측정 테스트를 위한 원본 Date.now 함수 저장
      const originalDateNow = Date.now;
      
      // Date.now 모의화
      Date.now = jest.fn()
        .mockReturnValueOnce(1000) // 첫 호출에서는 1000 반환
        .mockReturnValueOnce(1250); // 두 번째 호출에서는 1250 반환 (250ms 지연 시뮬레이션)
      
      // 요청 로깅 미들웨어 호출
      requestLoggingMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // 요청 로깅 함수가 올바른 정보와 함께 호출되었는지 확인
      expect(logRequestSpy).toHaveBeenCalledWith(mockRequest, mockResponse, 250);
      
      // 원래의 Date.now 함수 복원
      Date.now = originalDateNow;
    });
    
    test('성능 메트릭을 직접 로깅할 수 있어야 함', () => {
      // 성능 데이터 로깅
      LoggingService.logPerformance('db_query_time', 45.2, { 
        operation: 'select',
        table: 'users'
      });
      
      // 성능 로깅 함수가 올바른 정보와 함께 호출되었는지 확인
      expect(logPerformanceSpy).toHaveBeenCalledWith(
        'db_query_time', 
        45.2, 
        { operation: 'select', table: 'users' }
      );
    });
  });
  
  describe('보안 이벤트 로깅', () => {
    test('의심스러운 IP 주소가 로깅되어야 함', () => {
      // 의심스러운 IP 설정 (read-only 속성 대신 새 객체 생성)
      mockRequest = {
        ...mockRequest,
        ip: '1.2.3.4'
      };
      
      // 보안 로깅 미들웨어 호출
      securityLoggingMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // 보안 이벤트 로깅 함수가 호출되었는지 확인
      expect(logSecurityEventSpy).toHaveBeenCalledTimes(1);
      expect(logSecurityEventSpy).toHaveBeenCalledWith(
        mockRequest,
        'suspiciousIP',
        { ip: '1.2.3.4' }
      );
    });
    
    test('인증 실패 횟수가 임계값을 초과하면 로깅되어야 함', () => {
      // 인증 실패 횟수 헤더 설정
      mockRequest.headers = {
        ...mockRequest.headers,
        'x-failed-auth-count': '6'
      };
      
      // 보안 로깅 미들웨어 호출
      securityLoggingMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // 보안 이벤트 로깅 함수가 호출되었는지 확인
      expect(logSecurityEventSpy).toHaveBeenCalledTimes(1);
      expect(logSecurityEventSpy).toHaveBeenCalledWith(
        mockRequest,
        'authFailure',
        { count: '6', ip: '127.0.0.1' }
      );
    });
    
    test('정상적인 요청에서는 보안 이벤트 로깅이 호출되지 않아야 함', () => {
      // 일반 IP 및 헤더 설정 (read-only 속성 대신 새 객체 생성)
      mockRequest = {
        ...mockRequest,
        ip: '192.168.1.1',
        headers: {
          'user-agent': 'jest-test-agent'
        }
      };
      
      // 보안 로깅 미들웨어 호출
      securityLoggingMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      // 보안 이벤트 로깅 함수가 호출되지 않았는지 확인
      expect(logSecurityEventSpy).not.toHaveBeenCalled();
    });
  });
});