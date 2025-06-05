// __tests__/utils/error.test.tsx
import { handleApiError, isNetworkError, formatErrorMessage, ApiError, createErrorHandler } from '../../src/utils/error';
import axios from 'axios';

describe('오류 처리 유틸리티 테스트', () => {
  describe('handleApiError', () => {
    test('응답에 메시지가 있을 경우 해당 메시지를 반환해야 함', () => {
      const error = {
        response: {
          data: {
            message: '이메일 형식이 올바르지 않습니다.'
          }
        }
      };
      
      expect(handleApiError(error)).toBe('이메일 형식이 올바르지 않습니다.');
    });

    test('중첩된 오류 메시지 구조를 처리해야 함', () => {
      const error = {
        response: {
          data: {
            error: {
              message: '서버 연결에 실패했습니다.'
            }
          }
        }
      };
      
      expect(handleApiError(error)).toBe('서버 연결에 실패했습니다.');
    });

    test('네트워크 오류인 경우 일반적인 메시지를 반환해야 함', () => {
      const error = new Error('Network Error');
      expect(handleApiError(error)).toBe('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
    });

    test('알 수 없는 오류에는 기본 메시지를 반환해야 함', () => {
      const error = new Error('Unknown error');
      expect(handleApiError(error)).toBe('오류가 발생했습니다. 다시 시도해주세요.');
    });
  });

  describe('isNetworkError', () => {
    test('네트워크 관련 오류가 감지되어야 함', () => {
      expect(isNetworkError(new Error('Network Error'))).toBe(true);
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
      expect(isNetworkError(new Error('ECONNREFUSED'))).toBe(true);
      expect(isNetworkError(new Error('Connection refused'))).toBe(true);
      expect(isNetworkError(new Error('timeout'))).toBe(true);
    });

    test('네트워크 오류가 아닌 경우 false를 반환해야 함', () => {
      expect(isNetworkError(new Error('일반 오류'))).toBe(false);
      expect(isNetworkError(new Error('Validation Error'))).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe('formatErrorMessage', () => {
    test('커스텀 규칙에 있는 메시지는 해당 규칙을 적용해야 함', () => {
      const customRules = {
        'USER_NOT_FOUND': '사용자를 찾을 수 없습니다.',
        'INVALID_PASSWORD': '비밀번호가 올바르지 않습니다.'
      };
      
      expect(formatErrorMessage('USER_NOT_FOUND', customRules)).toBe('사용자를 찾을 수 없습니다.');
      expect(formatErrorMessage('INVALID_PASSWORD', customRules)).toBe('비밀번호가 올바르지 않습니다.');
    });

    test('오류 코드 형식의 메시지는 포맷팅되어야 함', () => {
      expect(formatErrorMessage('ERR_AUTH_001')).toBe('인증 오류가 발생했습니다. (ERR_AUTH_001)');
      expect(formatErrorMessage('ERR_SERVER_404')).toBe('오류가 발생했습니다. (ERR_SERVER_404)');
    });

    test('일반 메시지는 그대로 반환되어야 함', () => {
      expect(formatErrorMessage('일반적인 오류 메시지')).toBe('일반적인 오류 메시지');
    });
  });

  describe('ApiError', () => {
    test('ApiError 인스턴스가 올바르게 생성되어야 함', () => {
      const apiError = new ApiError('API 오류 발생', 404, { details: '요청한 리소스를 찾을 수 없습니다.' });
      
      expect(apiError.name).toBe('ApiError');
      expect(apiError.message).toBe('API 오류 발생');
      expect(apiError.statusCode).toBe(404);
      expect(apiError.data).toEqual({ details: '요청한 리소스를 찾을 수 없습니다.' });
      expect(apiError instanceof Error).toBe(true);
    });
  });

  describe('createErrorHandler', () => {
    test('Error 객체를 처리할 수 있어야 함', () => {
      const mockErrorHandler = jest.fn();
      const errorHandler = createErrorHandler(mockErrorHandler, '기본 오류 메시지');
      
      const error = new Error('처리된 오류 메시지');
      errorHandler(error);
      
      expect(mockErrorHandler).toHaveBeenCalledWith('처리된 오류 메시지');
    });

    test('Axios 오류 응답을 처리할 수 있어야 함', () => {
      const mockErrorHandler = jest.fn();
      const errorHandler = createErrorHandler(mockErrorHandler, '기본 오류 메시지');
      
      const axiosError = {
        response: {
          data: {
            message: 'API 응답 오류 메시지'
          }
        }
      };
      errorHandler(axiosError);
      
      expect(mockErrorHandler).toHaveBeenCalledWith('API 응답 오류 메시지');
    });

    test('알 수 없는 오류 형태에 대해 기본 메시지를 사용해야 함', () => {
      const mockErrorHandler = jest.fn();
      const errorHandler = createErrorHandler(mockErrorHandler, '기본 오류 메시지');
      
      errorHandler({});
      
      expect(mockErrorHandler).toHaveBeenCalledWith('기본 오류 메시지');
    });
  });
});