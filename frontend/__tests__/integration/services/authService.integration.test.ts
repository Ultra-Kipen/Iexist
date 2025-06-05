// __tests__/integration/services/authService.integration.test.ts
import authService from '../../../src/services/api/authService';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AxiosError } from 'axios';

// apiClient 모킹
jest.mock('../../../src/services/api/client', () => {
  return {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn()
  };
});

// 실제 apiClient 가져오기
import apiClient from '../../../src/services/api/client';

describe('Auth Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('logs in successfully', async () => {
    const mockResponse = {
      status: 'success',
      message: '로그인 성공',
      data: {
        token: 'test-token',
        user: {
          user_id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      }
    };
    
    // apiClient.post 모킹
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await authService.login(loginData);
    
    expect(response.data).toEqual(mockResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginData);
  });
  
  it('registers a new user', async () => {
    const mockResponse = {
      status: 'success',
      message: '회원가입 성공',
      data: {
        token: 'new-token',
        user: {
          user_id: 2,
          username: 'newuser',
          email: 'new@example.com'
        }
      }
    };
    
    // apiClient.post 모킹
    (apiClient.post as jest.Mock).mockResolvedValue({ 
      data: mockResponse, 
      status: 201 
    });
    
    const registerData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123'
    };
    
    const response = await authService.register(registerData);
    
    expect(response.data).toEqual(mockResponse);
    expect(response.status).toBe(201);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
  });
  
  it('handles login failure', async () => {
    const errorResponse = {
      status: 'error',
      message: '잘못된 인증 정보입니다.'
    };
    
    // 에러 응답 모킹
    const mockError = new Error('Auth Error') as AxiosError;
    mockError.response = {
      data: errorResponse,
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as any
    };
    
    (apiClient.post as jest.Mock).mockRejectedValue(mockError);
    
    const loginData = {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    };
    
    try {
      await authService.login(loginData);
      // 오류가 발생하지 않으면 테스트 실패
      fail('로그인 실패 테스트에서 예외가 발생하지 않았습니다.');
    } catch (error) {
      const axiosError = error as AxiosError;
      expect(axiosError.response?.status).toBe(401);
      expect(axiosError.response?.data).toEqual(errorResponse);
    }
    
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginData);
  });
  
  it('refreshes token', async () => {
    const mockResponse = {
      status: 'success',
      message: '토큰 갱신 성공',
      data: {
        token: 'new-token'
      }
    };
    
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });
    
    const oldToken = 'old-token';
    const response = await authService.refreshToken(oldToken);
    
    expect(response.data).toEqual(mockResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', { token: oldToken });
  });
  
  it('logs out user', async () => {
    const mockResponse = {
      status: 'success',
      message: '로그아웃 되었습니다.'
    };
    
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });
    
    const response = await authService.logout();
    
    expect(response.data.message).toBe('로그아웃 되었습니다.');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
  });
  
  it('gets user profile', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        nickname: '테스트유저'
      }
    };
    
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });
    
    const response = await authService.getProfile();
    
    expect(response.data).toEqual(mockResponse);
    expect(apiClient.get).toHaveBeenCalledWith('/users/profile');
  });
  
  it('updates user profile', async () => {
    const mockResponse = {
      status: 'success',
      message: '프로필이 업데이트되었습니다.',
      data: {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        nickname: '새닉네임'
      }
    };
    
    (apiClient.put as jest.Mock).mockResolvedValue({ data: mockResponse });
    
    const profileData = {
      nickname: '새닉네임'
    };
    
    const response = await authService.updateProfile(profileData);
    
    expect(response.data).toEqual(mockResponse);
    expect(apiClient.put).toHaveBeenCalledWith('/users/profile', profileData);
  });
});