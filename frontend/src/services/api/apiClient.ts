// src/services/api/apiClient.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 클라이언트 기본 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // 서버 URL 설정
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초
});

// 요청 인터셉터 설정 (인증 토큰 추가)
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('API 인터셉터 오류:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 에러 처리 (토큰 만료 등)
    if (error.response && error.response.status === 401) {
      // 토큰 만료 처리 로직
      await AsyncStorage.removeItem('auth_token');
      // 로그인 화면으로 리다이렉트 등의 로직 추가
    }
    return Promise.reject(error);
  }
);

export default apiClient;