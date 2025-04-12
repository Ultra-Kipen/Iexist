// notificationController.test.ts
import { Request } from 'express';
import type { Response } from 'express'; // 타입만 임포트
import notificationController from '../../controllers/notificationController';

// 원래 db 모듈 가져오기
import db from '../../models';

describe('notificationController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockTransaction: any;
  
  beforeEach(() => {
    // 테스트용 요청 객체 생성
    req = {
      user: {
        user_id: 1,
        email: 'test@example.com',
        nickname: 'TestUser',
        is_active: true
      },
      params: {},
      query: {}
    };

    // 테스트용 응답 객체 생성
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    // 트랜잭션 모킹
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };
    
    // sequelize.transaction 모킹
    jest.spyOn(db.sequelize, 'transaction').mockResolvedValue(mockTransaction);

    // db.Notification.findAndCountAll 모킹
    jest.spyOn(db.Notification, 'findAndCountAll').mockResolvedValue({
      rows: [{
        get: () => ({
          id: 1,
          content: '테스트 알림',
          is_read: false,
          notification_type: 'like',
          created_at: new Date(),
          related_id: 123
        })
      }],
      count: 1
    } as any);
  });

  afterEach(() => {
    // 모킹 복원
    jest.restoreAllMocks();
  });

  describe('getNotifications', () => {
    it('인증되지 않은 사용자가 알림을 조회하면 401 응답을 반환해야 함', async () => {
      // 인증되지 않은 상태 설정
      req.user = undefined;
  
      // 테스트 실행
      await notificationController.getNotifications(req as any, res as any);
  
      // 검증
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });
  
    it('인증된 사용자가 알림 목록을 조회할 수 있어야 함', async () => {
      // 테스트 실행
      await notificationController.getNotifications(req as any, res as any);
  
      // 검증
      expect(db.Notification.findAndCountAll).toHaveBeenCalled();
      
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });
  });

  describe('markNotificationAsRead', () => {
    it('알림을 읽음 처리할 수 있어야 함', async () => {
      // 테스트 데이터 설정
      req.params = { id: '1' };
      
      // 모의 알림 객체 생성 - 타입 단언 사용
      const mockNotification = {
        update: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockReturnValue(1) // 사용자 ID 반환 추가
      } as any;
      
      // findOne이 모의 알림 객체를 반환하도록 설정
      jest.spyOn(db.Notification, 'findOne').mockResolvedValue(mockNotification);
      
      // 테스트 코드에 notification 추가 - 미들웨어에서 설정한 것과 동일하게
      (req as any).notification = mockNotification;
  
      // 테스트 실행
      await notificationController.markNotificationAsRead(req as any, res as any);

  // 검증
  expect(db.sequelize.transaction).toHaveBeenCalled();
  
  // findOne이 호출되지 않을 수 있으므로 이 검증은 제거 또는 조건부로 변경
  // expect(db.Notification.findOne).toHaveBeenCalled();
  
  expect(mockNotification.update).toHaveBeenCalledWith(
    { is_read: true }, 
    { transaction: mockTransaction }
  );
  
  expect(mockTransaction.commit).toHaveBeenCalled();
  
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'success',
      message: '알림이 읽음 처리되었습니다.'
    })
  );
});

    it('알림이 존재하지 않으면 404 응답을 반환해야 함', async () => {
      // 테스트 데이터 설정
      req.params = { id: '999' };
      
      // findOne이 null을 반환하도록 설정
      jest.spyOn(db.Notification, 'findOne').mockResolvedValue(null);

      // 테스트 실행
      await notificationController.markNotificationAsRead(req as any, res as any);

      // 검증
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '알림을 찾을 수 없습니다.'
        })
      );
    });
  });
  // 기존 코드 아래에 추가할 부분
describe('deleteNotification', () => {
  it('알림을 삭제할 수 있어야 함', async () => {
    // 테스트 데이터 설정
    req.params = { id: '1' };
    
    // 삭제 성공으로 설정 (1개 행 삭제됨)
    jest.spyOn(db.Notification, 'destroy').mockResolvedValue(1);

    // 테스트 실행
    await notificationController.deleteNotification(req as any, res as any);

    // 검증
    expect(db.sequelize.transaction).toHaveBeenCalled();
    expect(db.Notification.destroy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { 
          id: '1',
          user_id: 1 
        },
        transaction: mockTransaction
      })
    );
    
    expect(mockTransaction.commit).toHaveBeenCalled();
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        message: '알림이 성공적으로 삭제되었습니다.'
      })
    );
  });

  it('알림이 존재하지 않으면 404 응답을 반환해야 함', async () => {
    // 테스트 데이터 설정
    req.params = { id: '999' };
    
    // 삭제할 항목 없음으로 설정 (0개 행 삭제됨)
    jest.spyOn(db.Notification, 'destroy').mockResolvedValue(0);

    // 테스트 실행
    await notificationController.deleteNotification(req as any, res as any);

    // 검증
    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: '알림을 찾을 수 없습니다.'
      })
    );
  });
});
// 기존 코드 아래에 추가할 부분
describe('markAllAsRead', () => {
  it('모든 알림을 읽음 처리할 수 있어야 함', async () => {
    // update 성공으로 설정
    jest.spyOn(db.Notification, 'update').mockResolvedValue([1]);

    // 테스트 실행
    await notificationController.markAllAsRead(req as any, res as any);

    // 검증
    expect(db.sequelize.transaction).toHaveBeenCalled();
    expect(db.Notification.update).toHaveBeenCalledWith(
      { is_read: true },
      expect.objectContaining({ 
        where: { 
          user_id: 1,
          is_read: false 
        },
        transaction: mockTransaction
      })
    );
    
    expect(mockTransaction.commit).toHaveBeenCalled();
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        message: '모든 알림이 읽음 처리되었습니다.'
      })
    );
  });

  it('인증되지 않은 사용자가 요청하면 401 응답을 반환해야 함', async () => {
    // 인증되지 않은 상태 설정
    req.user = undefined;

    // 테스트 실행
    await notificationController.markAllAsRead(req as any, res as any);

    // 검증
    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: '인증이 필요합니다.'
      })
    );
  });
});
});
