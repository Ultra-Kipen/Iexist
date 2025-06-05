// __tests__/unit/services/api/emailService.test.ts

import emailService from '../../../../src/services/api/emailService';
import client from '../../../../src/services/api/client';

// client를 모킹
jest.mock('../../../../src/services/api/client');
const mockedClient = client as jest.Mocked<typeof client>;

describe('emailService', () => {
  beforeEach(() => {
    // 모든 모크 초기화
    jest.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('비밀번호 재설정 요청에 성공해야 함', async () => {
      const email = 'test@example.com';
      const mockResponse = { 
        data: { 
          message: '비밀번호 재설정 링크 발송' 
        } 
      };

      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await emailService.requestPasswordReset(email);
      
      expect(mockedClient.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('비밀번호 재설정에 성공해야 함', async () => {
      const token = 'reset_token_123';
      const newPassword = 'newStrongPassword123!';
      const mockResponse = { 
        data: { 
          message: '비밀번호 재설정 완료' 
        } 
      };

      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await emailService.resetPassword(token, newPassword);
      
      expect(mockedClient.post).toHaveBeenCalledWith('/auth/reset-password', { 
        token, 
        new_password: newPassword 
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('requestVerificationCode', () => {
    it('이메일 확인 코드 요청에 성공해야 함', async () => {
      const email = 'test@example.com';
      const mockResponse = { 
        data: { 
          message: '인증 코드 발송' 
        } 
      };

      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await emailService.requestVerificationCode(email);
      
      expect(mockedClient.post).toHaveBeenCalledWith('/auth/request-verification', { email });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyCode', () => {
    it('이메일 확인 코드 검증에 성공해야 함', async () => {
      const email = 'test@example.com';
      const code = '123456';
      const mockResponse = { 
        data: { 
          message: '이메일 인증 성공' 
        } 
      };

      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await emailService.verifyCode(email, code);
      
      expect(mockedClient.post).toHaveBeenCalledWith('/auth/verify-email', { email, code });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendContactRequest', () => {
    it('연락 요청 전송에 성공해야 함', async () => {
      const name = '김테스트';
      const email = 'test@example.com';
      const subject = '문의사항';
      const message = '도움이 필요합니다.';
      const mockResponse = { 
        data: { 
          message: '문의 접수 완료' 
        } 
      };

      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await emailService.sendContactRequest(name, email, subject, message);
      
      expect(mockedClient.post).toHaveBeenCalledWith('/contact', { 
        name, 
        email, 
        subject, 
        message 
      });
      expect(result).toEqual(mockResponse);
    });
  });
});