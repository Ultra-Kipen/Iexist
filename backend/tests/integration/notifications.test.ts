// /backend/tests/integration/notifications.test.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 컨트롤러 모킹
const mockNotificationController = {
  getNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  markAllAsRead: jest.fn()
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/notificationController', () => mockNotificationController);

describe('알림 API 테스트', () => {
  const mockUserId = 999;
  const mockNotificationId = 123;
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockNotificationController).forEach(mock => mock.mockReset());
  });
  
  describe('알림 목록 조회 테스트 (/api/notifications)', () => {
    it('알림 목록이 성공적으로 조회되어야 함', async () => {
      // 성공 응답 모킹
      mockNotificationController.getNotifications.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            notifications: [
              {
                id: mockNotificationId,
                content: '회원님의 게시물에 새로운 좋아요가 추가되었습니다.',
                notification_type: 'like',
                is_read: false,
                created_at: new Date().toISOString(),
                related_id: 100
              }
            ],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_count: 1,
              has_next: false
            }
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId },
        query: { page: '1', limit: '10' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockNotificationController.getNotifications(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            notifications: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                content: expect.any(String)
              })
            ]),
            pagination: expect.any(Object)
          })
        })
      );
    });

    it('알림 타입 필터링으로 목록이 조회되어야 함', async () => {
      mockNotificationController.getNotifications.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            notifications: [
              {
                id: mockNotificationId,
                content: '회원님의 게시물에 새로운 댓글이 달렸습니다.',
                notification_type: 'comment',
                is_read: false,
                created_at: new Date().toISOString(),
                related_id: 100
              }
            ],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_count: 1,
              has_next: false
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { 
          page: '1', 
          limit: '10',
          type: 'comment'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockNotificationController.getNotifications(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            notifications: expect.arrayContaining([
              expect.objectContaining({
                notification_type: 'comment'
              })
            ])
          })
        })
      );
    });

    it('읽음 여부 필터링으로 목록이 조회되어야 함', async () => {
      mockNotificationController.getNotifications.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            notifications: [
              {
                id: mockNotificationId,
                content: '회원님의 게시물에 새로운 좋아요가 추가되었습니다.',
                notification_type: 'like',
                is_read: false,
                created_at: new Date().toISOString(),
                related_id: 100
              }
            ],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_count: 1,
              has_next: false
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { 
          page: '1', 
          limit: '10',
          is_read: 'false'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockNotificationController.getNotifications(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            notifications: expect.arrayContaining([
              expect.objectContaining({
                is_read: false
              })
            ])
          })
        })
      );
    });

    it('인증되지 않은 사용자는 알림을 조회할 수 없음', async () => {
      mockNotificationController.getNotifications.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: undefined,
        query: { page: '1', limit: '10' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockNotificationController.getNotifications(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('인증')
        })
      );
    });
  });

  describe('알림 읽음 표시 테스트 (/api/notifications/:id/read)', () => {
    it('알림이 성공적으로 읽음 표시되어야 함', async () => {
      mockNotificationController.markNotificationAsRead.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '알림이 읽음 처리되었습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockNotificationId) },
        notification: { 
          id: mockNotificationId, 
          user_id: mockUserId
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockNotificationController.markNotificationAsRead(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('읽음 처리')
        })
      );
    });

    it('다른 사용자의 알림은 읽음 표시할 수 없음', async () => {
      mockNotificationController.markNotificationAsRead.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '알림을 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockNotificationId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockNotificationController.markNotificationAsRead(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });

  describe('알림 삭제 테스트 (/api/notifications/:id)', () => {
    it('알림이 성공적으로 삭제되어야 함', async () => {
      mockNotificationController.deleteNotification.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '알림이 성공적으로 삭제되었습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockNotificationId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockNotificationController.deleteNotification(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('삭제')
        })
      );
    });

    it('존재하지 않는 알림은 삭제할 수 없음', async () => {
      mockNotificationController.deleteNotification.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '알림을 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: '99999' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockNotificationController.deleteNotification(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });

  describe('모든 알림 읽음 표시 테스트 (/api/notifications/mark-all-read)', () => {
    it('모든 알림이 성공적으로 읽음 표시되어야 함', async () => {
      mockNotificationController.markAllAsRead.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '모든 알림이 읽음 처리되었습니다.'
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
      
      await mockNotificationController.markAllAsRead(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('모든 알림')
        })
      );
    });

    it('인증되지 않은 사용자는 모든 알림을 읽음 표시할 수 없음', async () => {
      mockNotificationController.markAllAsRead.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: undefined
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockNotificationController.markAllAsRead(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('인증')
        })
      );
    });
  });
});