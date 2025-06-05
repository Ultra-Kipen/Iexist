// src/services/api/client.ts

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 서버의 기본 URL 설정
const BASE_URL = 'http://10.0.2.2:3000/api'; // 안드로이드 에뮬레이터용

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃 설정
});

// 토큰 갱신 함수 - 정확한 오류 메시지를 위해 분리 유지
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
    // 메시지를 테스트와 정확히 일치시킴
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
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      // 테스트와 일치하는 메시지 사용
      console.error('토큰 가져오기 오류:', error);
    }
    return config;
  },
  (error) => {
    // 테스트와 일치하는 메시지 사용
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
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // 원래 요청 재시도
          return axios(originalRequest);
        } else {
          // 토큰 갱신 실패 - 로그아웃 처리
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('refresh_token');
          await AsyncStorage.removeItem('user');
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 테스트와 일치하는 메시지 사용
        console.error('토큰 갱신 오류:', refreshError);
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
        return Promise.reject(error); // 원본 오류 반환
      }
    }
    
    // 네트워크 오류 처리 (타임아웃, 연결 거부 등)
    if (!error.response) {
      // 자동 재시도 로직 (최대 3번)
      if (!originalRequest._retryCount || originalRequest._retryCount < 3) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        // 지수 백오프 적용 (1초, 2초, 4초)
        const delayMs = 1000 * Math.pow(2, (originalRequest._retryCount - 1));
        
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            apiClient(originalRequest)
              .then(resolve)
              .catch(reject);
          }, delayMs);
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;