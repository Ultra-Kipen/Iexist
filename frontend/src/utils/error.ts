import { AxiosError } from 'axios';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  originalError?: Error;
}

/**
 * API 오류를 앱 오류로 변환합니다.
 * @param error API 오류
 * @returns 앱 오류 객체
 */
export const handleApiError = (error: any): AppError => {
  if (error.response) {
    // 서버가 응답을 보낸 경우
    const status = error.response.status;
    
    if (status === 401) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: '인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.',
        code: 'AUTH_FAILED',
        details: error.response.data,
        originalError: error,
      };
    } else if (status === 403) {
      return {
        type: ErrorType.AUTHORIZATION,
        message: '해당 기능에 접근할 권한이 없습니다.',
        code: 'PERMISSION_DENIED',
        details: error.response.data,
        originalError: error,
      };
    } else if (status === 400 || status === 422) {
      return {
        type: ErrorType.VALIDATION,
        message: '입력하신 정보가 유효하지 않습니다. 다시 확인해주세요.',
        code: 'VALIDATION_ERROR',
        details: error.response.data,
        originalError: error,
      };
    } else if (status >= 500) {
      return {
        type: ErrorType.SERVER,
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        code: 'SERVER_ERROR',
        details: error.response.data,
        originalError: error,
      };
    }
  } else if (error.request) {
    // 네트워크 오류
    return {
      type: ErrorType.NETWORK,
      message: '네트워크 연결에 문제가 있습니다. 연결 상태를 확인해주세요.',
      code: 'NETWORK_ERROR',
      originalError: error,
    };
  }
  
  // 기타 오류
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || '알 수 없는 오류가 발생했습니다.',
    code: 'UNKNOWN_ERROR',
    originalError: error,
  };
};

/**
 * 오류를 로깅합니다.
 * @param error 오류 객체
 * @param context 추가 컨텍스트 정보
 */
export const logError = (error: Error | AppError, context?: any): void => {
  // 개발 환경에서 콘솔에 오류 로깅
  if (process.env.NODE_ENV === 'development') {
    console.error('오류 발생:', error, '컨텍스트:', context);
  }
};

/**
 * 사용자에게 표시할 친숙한 오류 메시지를 반환합니다.
 * @param error 오류 객체
 * @returns 사용자 친화적 오류 메시지
 */
export const getUserFriendlyMessage = (error: Error | AppError): string => {
  if ('type' in error) {
    return error.message;
  }
  
  // 일반 Error 객체인 경우 기본 메시지 반환
  return '앱에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
};