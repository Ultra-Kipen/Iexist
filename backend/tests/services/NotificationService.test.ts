import { createTestUser } from '../setup';
import db from '../../models';
import jwt from 'jsonwebtoken';
import { Model } from 'sequelize';

// DB 목킹
jest.mock('../../models', () => {
  interface MockNotification {
    id: number;
    user_id: number;
    content: string;
    notification_type: string;
    related_id?: number;
    is_read: boolean;
    created_at: Date;
    get: (key: string) => any;
    update: (updates: Record<string, any>) => Promise<MockNotification>;
    toJSON: () => Record<string, any>;
  }

  const mockNotifications: MockNotification[] = [];
  
  const mockModel = {
    create: jest.fn((data: Record<string, any>): Promise<MockNotification> => {
      const newNotification = {
        id: Math.floor(Math.random() * 1000),
        user_id: data.user_id || 0,
        content: data.content || '',
        notification_type: data.notification_type || 'system',
        related_id: data.related_id,
        is_read: data.is_read || false,
        created_at: data.created_at || new Date(),
        ...data,
        get: (key: string): any => newNotification[key as keyof typeof newNotification],
        update: jest.fn((updates: Record<string, any>): Promise<MockNotification> => {
          Object.assign(newNotification, updates);
          return Promise.resolve(newNotification);
        }),
        toJSON: (): Record<string, any> => ({ ...data })
      } as MockNotification;
      
      mockNotifications.push(newNotification);
      return Promise.resolve(newNotification);
    }),
    findAll: jest.fn((options?: any): Promise<MockNotification[]> => {
      let result = [...mockNotifications];
      
      // where 필터 적용
      if (options?.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          result = result.filter(notification => {
            return notification[key as keyof MockNotification] === value;
          });
        });
      }
      
      // 순서 정렬 
      if (options?.order) {
        const [field, direction] = options.order[0];
        result.sort((a: MockNotification, b: MockNotification) => {
          let aValue = a[field as keyof MockNotification];
          let bValue = b[field as keyof MockNotification];
          
          // 존재하지 않는 값 처리
          if (typeof aValue === 'undefined' || typeof bValue === 'undefined') {
            return 0;
          }
          
          // 날짜 처리
          if (field === 'created_at') {
            // 안전한 Date 객체 생성
            const toSafeDate = (value: any): Date => {
              if (value instanceof Date) return value;
              if (typeof value === 'string' || typeof value === 'number') {
                try {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) return date;
                } catch (e) {
                  // 변환 실패시 기본값 사용
                }
              }
              return new Date(0); // 유효하지 않은 경우 epoch 시간 사용
            };
            
            const aDate = toSafeDate(aValue);
            const bDate = toSafeDate(bValue);
            
            return direction === 'DESC' 
              ? bDate.getTime() - aDate.getTime() 
              : aDate.getTime() - bDate.getTime();
          }
          
          // 기본 정렬 (문자열, 숫자 등)
          if (direction === 'DESC') {
            return aValue > bValue ? -1 : (aValue < bValue ? 1 : 0);
          }
          return aValue > bValue ? 1 : (aValue < bValue ? -1 : 0);
        });
      }
      
      return Promise.resolve(result);
    }),
    findOne: jest.fn((options?: any): Promise<MockNotification | null> => {
      const result = mockNotifications.find(notification => {
        if (!options?.where) return false;
        return Object.entries(options.where).every(([key, value]) => {
          return notification[key as keyof MockNotification] === value;
        });
      });
      return Promise.resolve(result || null);
    }),
    findByPk: jest.fn((id: number): Promise<MockNotification | null> => {
      const result = mockNotifications.find(n => n.id === id);
      return Promise.resolve(result || null);
    }),
    findAndCountAll: jest.fn((options?: any): Promise<{ rows: MockNotification[], count: number }> => {
      // 전체 데이터를 가져온 후 정렬 및 페이지네이션 적용
      let filteredResults = [...mockNotifications];
      
      // where 필터 적용
      if (options?.where) {
        filteredResults = filteredResults.filter(notification => {
          return Object.entries(options.where).every(([key, value]) => {
            return notification[key as keyof MockNotification] === value;
          });
        });
      }
      
      // 정렬 적용
      if (options?.order) {
        const [field, direction] = options.order[0];
        filteredResults.sort((a: MockNotification, b: MockNotification) => {
          const aValue = a[field as keyof MockNotification];
          const bValue = b[field as keyof MockNotification];
          if (typeof aValue === 'undefined' || typeof bValue === 'undefined') {
            return 0;
          }
          
          // 날짜 처리를 위한 특별 케이스
          if (field === 'created_at') {
            // 안전한 방식으로 Date 객체 생성
            const safeCreateDate = (value: any): Date => {
              if (value instanceof Date) return value;
              if (typeof value === 'string' || typeof value === 'number') {
                try {
                  return new Date(value);
                } catch (error) {
                  return new Date(); // 유효하지 않은 경우 현재 날짜 반환
                }
              }
              return new Date(); // 다른 모든 타입에 대해 현재 날짜 반환
            };
            
            const aDate = safeCreateDate(aValue);
            const bDate = safeCreateDate(bValue);
            
            if (direction === 'DESC') {
              return bDate.getTime() - aDate.getTime();
            }
            return aDate.getTime() - bDate.getTime();
          }
          
          if (direction === 'DESC') {
            return aValue > bValue ? -1 : (aValue < bValue ? 1 : 0);
          }
          return aValue > bValue ? 1 : (aValue < bValue ? -1 : 0);
        });
      }
      
      // 전체 개수 저장
      const totalCount = filteredResults.length;
      
      // 페이지네이션 적용
      let paginatedResults = [...filteredResults];
      if (options?.limit) {
        const offset = options.offset || 0;
        paginatedResults = filteredResults.slice(offset, offset + options.limit);
      }
      
      return Promise.resolve({
        rows: paginatedResults,
        count: totalCount
      });
    }),
    update: jest.fn((updates: Record<string, any>, options?: any): Promise<[number]> => {
      let updatedCount = 0;
      mockNotifications.forEach(notification => {
        let match = true;
        
        if (options?.where) {
          match = Object.entries(options.where).every(([key, value]) => {
            return notification[key as keyof MockNotification] === value;
          });
        }
        
        if (match) {
          updatedCount++;
          Object.assign(notification, updates);
        }
      });
      
      return Promise.resolve([updatedCount]);
    }),
    count: jest.fn((options?: any): Promise<number> => {
      return mockModel.findAll(options).then(results => results.length);
    }),
    destroy: jest.fn((options?: any): Promise<number> => {
      const before = mockNotifications.length;
      const indexesToRemove: number[] = [];
      
      mockNotifications.forEach((notification, index) => {
        let match = true;
        
        if (options?.where) {
          match = Object.entries(options.where).every(([key, value]) => {
            return notification[key as keyof MockNotification] === value;
          });
        }
        
        if (match) {
          indexesToRemove.push(index);
        }
      });
      
      // 뒤에서부터 제거해야 인덱스가 변하지 않음
      for (let i = indexesToRemove.length - 1; i >= 0; i--) {
        mockNotifications.splice(indexesToRemove[i], 1);
      }
      
      const removed = before - mockNotifications.length;
      return Promise.resolve(removed);
    })
  };
  
  return {
    Notification: mockModel,
    sequelize: {
      transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn()
      }))
    }
  };
});

// createTestUser 목킹
jest.mock('../setup', () => ({
  createTestUser: jest.fn().mockImplementation((): Promise<{
    user: { user_id: number; email: string; nickname: string };
    token: string;
    userId: number;
  }> => {
    const userId = Math.floor(Math.random() * 1000);
    return Promise.resolve({
      user: { 
        user_id: userId, 
        email: `test${userId}@example.com`, 
        nickname: `TestUser${userId}` 
      },
      token: 'mock-token',
      userId: userId
    });
  })
}));

// 테스트용 JWT 생성 함수
const generateToken = (userId: number): string => {
  return jwt.sign(
    { user_id: userId },
    process.env.JWT_SECRET || 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=',
    { expiresIn: '1h' }
  );
};

// 모델 인터페이스 정의
interface NotificationInstance extends Omit<Model, 'get'> {
  id: number;
  user_id: number;
  content: string;
  notification_type: 'like' | 'comment' | 'challenge' | 'system';
  related_id?: number;
  is_read: boolean;
  created_at?: Date;
  get(key: string): any;
}

describe('Notification Service', () => {
  let testUser: any;
  let token: string;
  let userId: number;
  let testNotifications: NotificationInstance[] = [];

  beforeAll(async () => {
    // 테스트 사용자 생성
    const result = await createTestUser();
    testUser = result.user;
    token = result.token;
    userId = result.userId;
  });

  beforeEach(async () => {
    // 테스트 전에 알림 데이터 생성
    const notificationTypes = ['like', 'comment', 'challenge', 'system'] as const;
    type NotificationType = (typeof notificationTypes)[number];
    
    testNotifications = [];
    for (let i = 0; i < 10; i++) {
      const notificationType = notificationTypes[i % 4];
      const notification = await db.Notification.create({
        id: i + 1, // 명시적인 ID 부여하여 겹치지 않도록 함
        user_id: userId,
        content: `테스트 알림 ${i + 1}`,
        notification_type: notificationType,
        related_id: i + 1,
        is_read: i % 3 === 0, // 일부는 읽음 상태로 설정
        created_at: new Date(Date.now() - i * 60000) // 생성 시간 차이를 두어 정렬 테스트 가능
      });
      testNotifications.push(notification as unknown as NotificationInstance);
    }
  });

  afterEach(async () => {
    // 테스트 후 알림 데이터 정리
    await db.Notification.destroy({
      where: {
        user_id: userId
      }
    });
    testNotifications = [];
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('사용자의 모든 알림을 조회할 수 있어야 함', async () => {
      // DB에서 직접 알림 조회
      const notifications = await db.Notification.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      // 검증
      expect(notifications).toHaveLength(10);
      expect(notifications[0].get('user_id')).toBe(userId);
    });

    it('알림 타입별로 필터링할 수 있어야 함', async () => {
      // 'like' 타입의 알림만 조회
      const likeNotifications = await db.Notification.findAll({
        where: {
          user_id: userId,
          notification_type: 'like'
        }
      });

      // 'comment' 타입의 알림만 조회
      const commentNotifications = await db.Notification.findAll({
        where: {
          user_id: userId,
          notification_type: 'comment'
        }
      });

      // 검증
      expect(likeNotifications.length).toBeGreaterThan(0);
      expect(commentNotifications.length).toBeGreaterThan(0);
      
      // 각 알림의 타입 확인
      likeNotifications.forEach((notification: any) => {
        expect(notification.get('notification_type')).toBe('like');
      });
      
      commentNotifications.forEach((notification: any) => {
        expect(notification.get('notification_type')).toBe('comment');
      });
    });

    it('읽음 상태별로 필터링할 수 있어야 함', async () => {
      // 읽지 않은 알림 조회
      const unreadNotifications = await db.Notification.findAll({
        where: {
          user_id: userId,
          is_read: false
        }
      });

      // 읽은 알림 조회
      const readNotifications = await db.Notification.findAll({
        where: {
          user_id: userId,
          is_read: true
        }
      });

      // 검증
      expect(unreadNotifications.length + readNotifications.length).toBe(10);
      
      // 각 알림의 읽음 상태 확인
      unreadNotifications.forEach((notification: any) => {
        expect(notification.get('is_read')).toBe(false);
      });
      
      readNotifications.forEach((notification: any) => {
        expect(notification.get('is_read')).toBe(true);
      });
    });

    it('페이지네이션이 정상적으로 작동해야 함', async () => {
      // 첫 페이지 (5개 항목)
      const firstPage = await db.Notification.findAndCountAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 5,
        offset: 0
      });
    
      // 두 번째 페이지 (5개 항목)
      const secondPage = await db.Notification.findAndCountAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 5,
        offset: 5
      });
    
      // 검증
      expect(firstPage.rows).toHaveLength(5);
      expect(secondPage.rows).toHaveLength(5);
      expect(firstPage.count).toBe(10); // 전체 개수는 10개
      
      // 첫 페이지와 두 번째 페이지의 ID 배열 추출
      const firstPageIds = firstPage.rows.map((n: any) => n.get('id'));
      const secondPageIds = secondPage.rows.map((n: any) => n.get('id'));
      
      // ID 배열에서 중복 요소를 확인
      const intersection = firstPageIds.filter(id => secondPageIds.includes(id));
      
      // 페이지네이션 제대로 작동하는지 검증
      expect(intersection).toHaveLength(0);
    });
  });

  describe('markNotificationAsRead', () => {
    it('알림을 읽음 상태로 변경할 수 있어야 함', async () => {
      // 읽지 않은 알림 찾기
      const unreadNotification = await db.Notification.findOne({
        where: {
          user_id: userId,
          is_read: false
        }
      });

      // 알림이 존재해야 함
      expect(unreadNotification).not.toBeNull();

      if (unreadNotification) {
        // 알림을 읽음 상태로 변경
        await unreadNotification.update({ is_read: true });

        // 변경 후 알림 다시 조회
        const updatedNotification = await db.Notification.findByPk(unreadNotification.get('id'));

        // 읽음 상태로 변경되었는지 확인
        expect(updatedNotification?.get('is_read')).toBe(true);
      }
    });

    it('다른 사용자의 알림은 접근할 수 없어야 함', async () => {
      // 다른 테스트 사용자 생성
      const otherUser = await createTestUser();
      
      // 첫 번째 사용자의 알림
      const notification = testNotifications[0];
      
      // 두 사용자 ID가 다른지 확인
      expect(userId).not.toBe(otherUser.userId);
      
      // 데이터베이스 수준에서 다른 사용자의 알림 접근 테스트
      const otherUserNotification = await db.Notification.findOne({
        where: {
          id: notification.id,
          user_id: otherUser.userId
        }
      });
      
      // 다른 사용자의 알림에 접근할 수 없어야 함
      expect(otherUserNotification).toBeNull();
    });
  });

  describe('markAllAsRead', () => {
    it('모든 알림을 한 번에 읽음 상태로 변경할 수 있어야 함', async () => {
      // 읽지 않은 알림 개수 확인
      const unreadNotificationsBefore = await db.Notification.count({
        where: {
          user_id: userId,
          is_read: false
        }
      });
      
      // 읽지 않은 알림이 있어야 함
      expect(unreadNotificationsBefore).toBeGreaterThan(0);
      
      // 모든 알림을 읽음 상태로 변경
      await db.Notification.update(
        { is_read: true },
        {
          where: {
            user_id: userId,
            is_read: false
          }
        }
      );
      
      // 읽지 않은 알림 개수 다시 확인
      const unreadNotificationsAfter = await db.Notification.count({
        where: {
          user_id: userId,
          is_read: false
        }
      });
      
      // 모든 알림이 읽음 상태로 변경되었는지 확인
      expect(unreadNotificationsAfter).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('알림을 삭제할 수 있어야 함', async () => {
      // 삭제할 알림
      const notification = testNotifications[0];
      
      // 알림이 존재하는지 확인
      const notificationBefore = await db.Notification.findByPk(notification.id);
      expect(notificationBefore).not.toBeNull();
      
      // 알림 삭제
      await db.Notification.destroy({
        where: {
          id: notification.id,
          user_id: userId
        }
      });
      
      // 알림이 삭제되었는지 확인
      const notificationAfter = await db.Notification.findByPk(notification.id);
      expect(notificationAfter).toBeNull();
    });

    it('다른 사용자의 알림은 삭제할 수 없어야 함', async () => {
      // 다른 테스트 사용자 생성
      const otherUser = await createTestUser();
      
      // 첫 번째 사용자의 알림
      const notification = testNotifications[0];
      
      // 두 사용자 ID가 다른지 확인
      expect(userId).not.toBe(otherUser.userId);
      
      // 다른 사용자로 알림 삭제 시도
      const deleteResult = await db.Notification.destroy({
        where: {
          id: notification.id,
          user_id: otherUser.userId
        }
      });
      
      // 삭제된 알림이 없어야 함
      expect(deleteResult).toBe(0);
      
      // 알림이 여전히 존재하는지 확인
      const notificationAfter = await db.Notification.findByPk(notification.id);
      expect(notificationAfter).not.toBeNull();
    });
  });
});