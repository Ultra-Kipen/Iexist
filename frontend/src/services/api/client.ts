// src/services/api/client.ts

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API 서버의 기본 URL 설정
// 테스트를 위해 원래 값으로 복원
const BASE_URL = 'http://10.0.2.2:3000/api'; // 안드로이드 에뮬레이터용

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃 설정
});

// 토큰 갱신 함수
const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return null;
    }
    
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken,
    });
    
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      return response.data.token;
    }
    
    return null;
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    return null;
  }
};

// 요청 인터셉터 설정 (인증 토큰 추가)
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      // 테스트와 일치하도록 메시지 변경
      console.error('토큰 가져오기 오류:', error);
    }
    return config;
  },
  (error) => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정 (토큰 만료 처리 등)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { 
      _retry?: boolean;
      _retryCount?: number;
    };
    
    // 401 에러(인증 실패) 및 재시도 안된 요청
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 갱신 시도
        const newToken = await refreshAuthToken();
        
        if (newToken) {
          // 새 토큰으로 요청 헤더 업데이트
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          } else if (originalRequest.headers === undefined) {
            originalRequest.headers = { 'Authorization': `Bearer ${newToken}` };
          }
          
          // 원래 요청 재시도 (이 부분 수정)
          // 인스턴스를 직접 사용하는 대신 새 요청을 생성
          return new Promise((resolve, reject) => {
            apiClient({
              ...originalRequest,
              baseURL: BASE_URL // baseURL 명시적 추가
            }).then(resolve).catch(reject);
          });
        } else {
          // 토큰 갱신 실패 - 로그아웃 처리
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('refresh_token');
          await AsyncStorage.removeItem('user');
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('토큰 갱신 프로세스 오류:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    
    // 네트워크 오류 처리 (타임아웃, 연결 거부 등)
    if (!error.response) {
      // 자동 재시도 로직 (최대 3번)
      if (!originalRequest._retryCount || originalRequest._retryCount < 3) {
        originalRequest._retryCount = originalRequest._retryCount ? originalRequest._retryCount + 1 : 1;
        
        // 지수 백오프 적용 (1초, 2초, 4초)
        const delayMs = 1000 * Math.pow(2, (originalRequest._retryCount - 1));
        
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // 이 부분도 수정 - Promise 체인 사용
            apiClient({
              ...originalRequest,
              baseURL: BASE_URL
            }).then(resolve).catch(reject);
          }, delayMs);
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;