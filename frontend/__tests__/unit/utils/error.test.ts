import { 
    handleApiError, 
    isNetworkError, 
    formatErrorMessage,
    ApiError,
    createErrorHandler
  } from '../../../src/utils/error';
  
  describe('Error utils', () => {
    describe('handleApiError', () => {
      it('should extract error message from API response', () => {
        const error = {
          response: {
            data: {
              message: '사용자 인증에 실패했습니다.'
            }
          }
        };
        
        const result = handleApiError(error);
        expect(result).toBe('사용자 인증에 실패했습니다.');
      });
  
      it('should extract error message from nested error object', () => {
        const error = {
          response: {
            data: {
              error: {
                message: '요청한 리소스를 찾을 수 없습니다.'
              }
            }
          }
        };
        
        const result = handleApiError(error);
        expect(result).toBe('요청한 리소스를 찾을 수 없습니다.');
      });
  
      it('should handle network errors', () => {
        const error = {
          message: 'Network Error'
        };
        
        const result = handleApiError(error);
        expect(result).toBe('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
      });
  
      it('should return default message for unknown errors', () => {
        const error = {};
        
        const result = handleApiError(error);
        expect(result).toBe('오류가 발생했습니다. 다시 시도해주세요.');
      });
    });
  
    describe('isNetworkError', () => {
      it('should identify network errors correctly', () => {
        expect(isNetworkError({ message: 'Network Error' })).toBe(true);
        expect(isNetworkError({ message: 'Failed to fetch' })).toBe(true);
        expect(isNetworkError({ message: 'ECONNREFUSED' })).toBe(true);
      });
  
      it('should reject non-network errors', () => {
        expect(isNetworkError({ message: 'Invalid credentials' })).toBe(false);
        expect(isNetworkError({ code: 404 })).toBe(false);
        expect(isNetworkError({})).toBe(false);
      });
    });
  
    describe('formatErrorMessage', () => {
      it('should format standard error messages', () => {
        expect(formatErrorMessage('Invalid email')).toBe('Invalid email');
      });
  
      it('should format error codes with messages', () => {
        expect(formatErrorMessage('ERR_AUTH_001')).toBe('인증 오류가 발생했습니다. (ERR_AUTH_001)');
      });
  
      it('should handle custom error format rules', () => {
        const customRules = {
          ERR_AUTH_001: '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.',
          ERR_NET_001: '서버 연결에 실패했습니다. 나중에 다시 시도해주세요.'
        };
        
        expect(formatErrorMessage('ERR_AUTH_001', customRules)).toBe('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        expect(formatErrorMessage('ERR_NET_001', customRules)).toBe('서버 연결에 실패했습니다. 나중에 다시 시도해주세요.');
        expect(formatErrorMessage('ERR_UNKNOWN', customRules)).toBe('오류가 발생했습니다. (ERR_UNKNOWN)');
      });
    });
  
    describe('ApiError', () => {
      it('should create correct error instance', () => {
        const apiError = new ApiError('Not found', 404);
        
        expect(apiError.message).toBe('Not found');
        expect(apiError.statusCode).toBe(404);
        expect(apiError instanceof Error).toBe(true);
      });
  
      it('should include additional data if provided', () => {
        const apiError = new ApiError('Validation error', 400, {
          fields: ['email', 'password']
        });
        
        expect(apiError.message).toBe('Validation error');
        expect(apiError.statusCode).toBe(400);
        expect(apiError.data).toEqual({ fields: ['email', 'password'] });
      });
    });
  
    describe('createErrorHandler', () => {
      it('should create a function that handles errors correctly', () => {
        const onError = jest.fn();
        const defaultMessage = '기본 오류 메시지';
        
        const errorHandler = createErrorHandler(onError, defaultMessage);
        
        // 에러 객체로 호출
        const error = new Error('테스트 오류');
        errorHandler(error);
        
        expect(onError).toHaveBeenCalledWith('테스트 오류');
        
        // API 오류 객체로 호출
        onError.mockClear();
        const apiError = {
          response: {
            data: {
              message: 'API 오류 메시지'
            }
          }
        };
        errorHandler(apiError);
        
        expect(onError).toHaveBeenCalledWith('API 오류 메시지');
        
        // 알 수 없는 오류로 호출
        onError.mockClear();
        errorHandler({});
        
        expect(onError).toHaveBeenCalledWith(defaultMessage);
      });
    });
  });