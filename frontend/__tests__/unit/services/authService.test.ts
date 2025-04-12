// __tests__/unit/services/authService.test.ts

import authService, { LoginCredentials, RegisterData } from '../../../src/services/api/authService';
import apiClient from '../../../src/services/api/client';

// apiClient 모킹
jest.mock('../../../src/services/api/client');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call apiClient.post with correct parameters', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      (apiClient.post as jest.Mock).mockResolvedValue({ data: { token: 'token' } });
      
      await authService.login(credentials);
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
    });
  });

  describe('register', () => {
    it('should call apiClient.post with correct parameters', async () => {
      const registerData: RegisterData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      (apiClient.post as jest.Mock).mockResolvedValue({ data: { token: 'token' } });
      
      await authService.register(registerData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
    });
  });

  describe('logout', () => {
    it('should call apiClient.post with correct path', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({});
      
      await authService.logout();
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('forgotPassword', () => {
    it('should call apiClient.post with correct parameters', async () => {
      const email = 'test@example.com';
      
      (apiClient.post as jest.Mock).mockResolvedValue({});
      
      await authService.forgotPassword(email);
      
      expect(apiClient.post).toHaveBeenCalledWith('/users/forgot-password', { email });
    });
  });

  describe('resetPassword', () => {
    it('should call apiClient.post with correct parameters', async () => {
      const token = 'reset-token';
      const newPassword = 'newpassword123';
      
      (apiClient.post as jest.Mock).mockResolvedValue({});
      
      await authService.resetPassword(token, newPassword);
      
      expect(apiClient.post).toHaveBeenCalledWith('/users/reset-password', { token, newPassword });
    });
  });

  describe('getProfile', () => {
    it('should call apiClient.get with correct path', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({});
      
      await authService.getProfile();
      
      expect(apiClient.get).toHaveBeenCalledWith('/users/profile');
    });
  });

  describe('updateProfile', () => {
    it('should call apiClient.put with correct parameters', async () => {
      const profileData = { nickname: 'new nickname' };
      
      (apiClient.put as jest.Mock).mockResolvedValue({});
      
      await authService.updateProfile(profileData);
      
      expect(apiClient.put).toHaveBeenCalledWith('/users/profile', profileData);
    });
  });
});