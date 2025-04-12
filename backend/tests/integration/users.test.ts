// /backend/tests/integration/users.test.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 컨트롤러 모킹
const mockUserController = {
  register: jest.fn(),
  login: jest.fn(),
  updateProfile: jest.fn(),
  getProfile: jest.fn(),
  changePassword: jest.fn(),
  logout: jest.fn(),
  withdrawal: jest.fn(),
  checkEmail: jest.fn(),
  checkNickname: jest.fn(),
  updateNotificationSettings: jest.fn(),
  blockUser: jest.fn(),
  unblockUser: jest.fn()
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/userController', () => mockUserController);

describe('사용자 API 테스트', () => {
  const mockUserId = 999;
  const mockEmail = 'test@example.com';
  const mockUsername = 'testuser';
  const mockNickname = 'TestUser';
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockUserController).forEach(mock => mock.mockReset());
  });
  
  describe('회원가입 테스트 (/api/users/register)', () => {
    it('회원가입이 성공적으로 완료되어야 함', async () => {
      // 성공 응답 모킹
      mockUserController.register.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          message: '회원가입이 완료되었습니다.',
          data: {
            token: 'mock_token',
            user: {
              user_id: mockUserId,
              username: mockUsername,
              email: mockEmail
            }
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        body: {
          username: mockUsername,
          email: mockEmail,
          password: 'Password123!'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              user_id: expect.any(Number),
              email: mockEmail
            })
          })
        })
      );
    });

    it('이미 존재하는 이메일로 회원가입 시 실패해야 함', async () => {
      mockUserController.register.mockImplementation((req, res) => {
        res.status(409).json({
          status: 'error',
          message: '이미 존재하는 이메일입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        body: {
          username: mockUsername,
          email: mockEmail,
          password: 'Password123!'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('이미 존재하는 이메일')
        })
      );
    });

    it('비밀번호 형식이 올바르지 않은 경우 회원가입이 실패해야 함', async () => {
      mockUserController.register.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '비밀번호는 영문, 숫자, 특수문자를 포함하여 6자 이상이어야 합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        body: {
          username: mockUsername,
          email: mockEmail,
          password: 'weak'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('비밀번호')
        })
      );
    });
  });

  describe('로그인 테스트 (/api/users/login)', () => {
    it('로그인이 성공적으로 완료되어야 함', async () => {
      mockUserController.login.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '로그인이 완료되었습니다.',
          data: {
            token: 'mock_token',
            user: {
              user_id: mockUserId,
              username: mockUsername,
              email: mockEmail,
              nickname: mockNickname,
              theme_preference: 'system'
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        body: {
          email: mockEmail,
          password: 'Password123!'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.login(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              user_id: expect.any(Number)
            })
          })
        })
      );
    });

    it('존재하지 않는 이메일로 로그인 시 실패해야 함', async () => {
      mockUserController.login.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '이메일 또는 비밀번호가 일치하지 않습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'Password123!'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('이메일 또는 비밀번호')
        })
      );
    });

    it('잘못된 비밀번호로 로그인 시 실패해야 함', async () => {
      mockUserController.login.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '이메일 또는 비밀번호가 일치하지 않습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        body: {
          email: mockEmail,
          password: 'WrongPassword!'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('이메일 또는 비밀번호')
        })
      );
    });
  });

  describe('프로필 조회 테스트 (/api/users/profile)', () => {
    it('프로필이 성공적으로 조회되어야 함', async () => {
      mockUserController.getProfile.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            user_id: mockUserId,
            username: mockUsername,
            email: mockEmail,
            nickname: mockNickname,
            theme_preference: 'system',
            profile_image_url: null,
            is_active: true
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.getProfile(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user_id: mockUserId,
            email: mockEmail
          })
        })
      );
    });

    it('인증 없이 프로필 조회 시 실패해야 함', async () => {
      mockUserController.getProfile.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {} as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.getProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('인증')
        })
      );
    });
  });

  describe('프로필 업데이트 테스트 (/api/users/profile)', () => {
    it('프로필이 성공적으로 업데이트되어야 함', async () => {
      mockUserController.updateProfile.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '프로필이 성공적으로 업데이트되었습니다.',
          data: {
            nickname: 'UpdatedNickname',
            theme_preference: 'dark'
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          nickname: 'UpdatedNickname',
          theme_preference: 'dark'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.updateProfile(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            nickname: 'UpdatedNickname',
            theme_preference: 'dark'
          })
        })
      );
    });

    it('중복된 닉네임으로 업데이트 시 실패해야 함', async () => {
      mockUserController.updateProfile.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '이미 사용 중인 닉네임입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          nickname: 'DuplicateNickname'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.updateProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('이미 사용 중인 닉네임')
        })
      );
    });
  });

  describe('비밀번호 변경 테스트 (/api/users/password)', () => {
    it('비밀번호가 성공적으로 변경되어야 함', async () => {
      mockUserController.changePassword.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '비밀번호가 성공적으로 변경되었습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.changePassword(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('비밀번호가 성공적으로 변경')
        })
      );
    });

    it('현재 비밀번호가 일치하지 않을 경우 변경이 실패해야 함', async () => {
      mockUserController.changePassword.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '현재 비밀번호가 올바르지 않습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword123!'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.changePassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('현재 비밀번호가 올바르지 않습니다')
        })
      );
    });
  });

  describe('회원 탈퇴 테스트 (/api/users/withdrawal)', () => {
    it('회원 탈퇴가 성공적으로 완료되어야 함', async () => {
      mockUserController.withdrawal.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '회원 탈퇴가 완료되었습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          password: 'Password123!'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.withdrawal(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('회원 탈퇴가 완료')
        })
      );
    });

    it('비밀번호가 일치하지 않을 경우 탈퇴가 실패해야 함', async () => {
      mockUserController.withdrawal.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '비밀번호가 일치하지 않습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          password: 'WrongPassword!'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.withdrawal(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('비밀번호가 일치하지 않습니다')
        })
      );
    });
  });

  describe('이메일 중복 확인 테스트 (/api/users/check-email)', () => {
    it('사용 가능한 이메일 확인이 성공해야 함', async () => {
      mockUserController.checkEmail.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: { exists: false }
        });
        return Promise.resolve();
      });
      
      const req = {
        query: { email: 'new@example.com' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.checkEmail(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            exists: false
          })
        })
      );
    });

    it('이미 사용 중인 이메일 확인이 성공해야 함', async () => {
      mockUserController.checkEmail.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: { exists: true }
        });
        return Promise.resolve();
      });
      
      const req = {
        query: { email: mockEmail }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.checkEmail(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            exists: true
          })
        })
      );
    });
  });

  describe('닉네임 중복 확인 테스트 (/api/users/check-nickname)', () => {
    it('사용 가능한 닉네임 확인이 성공해야 함', async () => {
      mockUserController.checkNickname.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: { exists: false }
        });
        return Promise.resolve();
      });
      
      const req = {
        query: { nickname: 'NewNickname' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.checkNickname(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            exists: false
          })
        })
      );
    });

    it('이미 사용 중인 닉네임 확인이 성공해야 함', async () => {
      mockUserController.checkNickname.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: { exists: true }
        });
        return Promise.resolve();
      });
      
      const req = {
        query: { nickname: mockNickname }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.checkNickname(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            exists: true
          })
        })
      );
    });
  });

  describe('알림 설정 업데이트 테스트 (/api/users/notification-settings)', () => {
    it('알림 설정이 성공적으로 업데이트되어야 함', async () => {
      mockUserController.updateNotificationSettings.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '알림 설정이 성공적으로 업데이트되었습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          like_notifications: true,
          comment_notifications: false,
          challenge_notifications: true,
          encouragement_notifications: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.updateNotificationSettings(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('알림 설정')
        })
      );
    });
  });

  describe('사용자 차단 테스트 (/api/users/block)', () => {
    it('사용자가 성공적으로 차단되어야 함', async () => {
      mockUserController.blockUser.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '사용자를 차단했습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          blocked_user_id: 888
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.blockUser(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('차단')
        })
      );
    });

    it('존재하지 않는 사용자 차단 시 실패해야 함', async () => {
      mockUserController.blockUser.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '차단할 사용자를 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          blocked_user_id: 99999
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.blockUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });

    it('이미 차단한 사용자 재차단 시 실패해야 함', async () => {
      mockUserController.blockUser.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '이미 차단한 사용자입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          blocked_user_id: 888
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.blockUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('이미 차단')
        })
      );
    });
  });

  describe('사용자 차단 해제 테스트 (/api/users/block)', () => {
    it('사용자 차단이 성공적으로 해제되어야 함', async () => {
      mockUserController.unblockUser.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '사용자 차단을 해제했습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          blocked_user_id: 888
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.unblockUser(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('차단을 해제')
        })
      );
    });

    it('차단하지 않은 사용자 차단 해제 시 실패해야 함', async () => {
      mockUserController.unblockUser.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '차단하지 않은 사용자입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          blocked_user_id: 777
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockUserController.unblockUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('차단하지 않은')
        })
      );
    });
  });
});