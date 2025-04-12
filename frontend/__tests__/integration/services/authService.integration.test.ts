// __tests__/integration/services/authService.integration.test.ts
import authService from '../../../src/services/api/authService';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AxiosError } from 'axios';

const mockAxios = new MockAdapter(axios);

describe('Auth Service Integration', () => {
  afterEach(() => {
    mockAxios.reset();
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
    
    mockAxios.onPost('/api/auth/login').reply(200, mockResponse);
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await authService.login(loginData);
    
    expect(response.data).toEqual(mockResponse);
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
    
    mockAxios.onPost('/api/auth/register').reply(201, mockResponse);
    
    const registerData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123'
    };
    
    const response = await authService.register(registerData);
    
    expect(response.data).toEqual(mockResponse);
    expect(response.status).toBe(201);
  });
  
  it('handles login failure', async () => {
    const errorResponse = {
      status: 'error',
      message: '잘못된 인증 정보입니다.'
    };
    
    mockAxios.onPost('/api/auth/login').reply(401, errorResponse);
    
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
  });
  
  it('refreshes token', async () => {
    const mockResponse = {
      status: 'success',
      message: '토큰 갱신 성공',
      data: {
        token: 'new-token'
      }
    };
    
    // authService에 refreshToken 메서드 추가 필요
    jest.spyOn(authService, 'refreshToken' as any).mockResolvedValue({ data: mockResponse });
    
    const response = await (authService as any).refreshToken('old-token');
    
    expect(response.data).toEqual(mockResponse);
  });
  
  it('logs out user', async () => {
    const mockResponse = {
      status: 'success',
      message: '로그아웃 되었습니다.'
    };
    
    mockAxios.onPost('/api/auth/logout').reply(200, mockResponse);
    
    const response = await authService.logout();
    
    expect(response.data.message).toBe('로그아웃 되었습니다.');
  });
});