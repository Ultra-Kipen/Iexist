import { Op } from 'sequelize'; // Op 객체 import 추가
import { createNotification } from '../../controllers/notificationController';
import db from '../../models';
import { createTestUser, testRequest } from '../setup';

describe('알림 API 엔드포인트 테스트', () => {
  let token: string;
  let userId: number;
  let notificationId: number;

  beforeEach(async () => {
    // 테스트 사용자 생성 및 토큰 발급
    const testUser = await createTestUser();
    token = testUser.token;
    userId = testUser.userId;

    // 테스트용 알림 생성
    const notification = await db.Notification.create({
      user_id: userId,
      content: '테스트 알림 내용입니다.',
      notification_type: 'system',
      is_read: false
    });
    notificationId = notification.get('id');
  });

  describe('GET /api/notifications', () => {
    it('인증된 사용자는 자신의 알림 목록을 조회할 수 있어야 합니다.', async () => {
      const response = await testRequest
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('notifications');
      expect(Array.isArray(response.body.data.notifications)).toBeTruthy();
      expect(response.body.data.notifications.length).toBeGreaterThan(0);
    });

    it('인증되지 않은 사용자는 알림 목록을 조회할 수 없어야 합니다.', async () => {
      const response = await testRequest.get('/api/notifications');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('페이지네이션이 제대로 작동해야 합니다.', async () => {
      // 추가 알림 9개 더 생성 (총 10개)
      for (let i = 0; i < 9; i++) {
        await db.Notification.create({
          user_id: userId,
          content: `추가 테스트 알림 ${i + 1}`,
          notification_type: 'system',
          is_read: false
        });
      }

      // 한 페이지에 5개씩 조회
      const response = await testRequest
        .get('/api/notifications?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.notifications.length).toBe(5);
      expect(response.body.data.pagination.total_count).toBeGreaterThanOrEqual(10);
      expect(response.body.data.pagination.total_pages).toBeGreaterThanOrEqual(2);
    });

    it('알림 타입 필터링이 제대로 작동해야 합니다.', async () => {
      // 다른 타입의 알림 추가
      await db.Notification.create({
        user_id: userId,
        content: '좋아요 알림',
        notification_type: 'like',
        is_read: false
      });

      // 시스템 알림만 필터링
      const response = await testRequest
        .get('/api/notifications?type=system')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.notifications.every((n: any) => n.notification_type === 'system')).toBeTruthy();
    });
    
    it('읽음 상태에 따른 필터링이 제대로 작동해야 합니다.', async () => {
      // 읽은 알림과 안 읽은 알림 모두 생성
      await db.Notification.create({
        user_id: userId,
        content: '읽은 알림',
        notification_type: 'system',
        is_read: true
      });
      
      // 읽지 않은 알림만 필터링
      const response = await testRequest
        .get('/api/notifications?is_read=false')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.notifications.every((n: any) => n.is_read === false)).toBeTruthy();
    });
    
    it('타입과 읽음 상태를 동시에 필터링할 수 있어야 합니다.', async () => {
      // 다양한 타입과 읽음 상태의 알림 생성
      await db.Notification.create({
        user_id: userId,
        content: '읽은 좋아요 알림',
        notification_type: 'like',
        is_read: true
      });
      
      await db.Notification.create({
        user_id: userId,
        content: '안 읽은 좋아요 알림',
        notification_type: 'like',
        is_read: false
      });
      
      // 읽지 않은 좋아요 알림만 필터링
      const response = await testRequest
        .get('/api/notifications?type=like&is_read=false')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      const notifications = response.body.data.notifications;
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications.every((n: any) => n.notification_type === 'like' && n.is_read === false)).toBeTruthy();
    });
  });

  describe('POST /api/notifications/:id/read', () => {
    it('사용자가 자신의 알림을 읽음 처리할 수 있어야 합니다.', async () => {
      const response = await testRequest
        .post(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('알림이 읽음 처리되었습니다.');
  
      // DB에서 알림 상태 확인
      const notification = await db.Notification.findByPk(notificationId);
      expect(notification?.get('is_read')).toBe(true);
    });
  
    it('존재하지 않는 알림 ID로 요청하면 404 응답을 반환해야 합니다.', async () => {
      const nonExistentId = 9999;
      const response = await testRequest
        .post(`/api/notifications/${nonExistentId}/read`)
        .set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  
    it('다른 사용자의 알림을 읽음 처리할 수 없어야 합니다.', async () => {
      // 다른 테스트 사용자 생성
      const anotherUser = await createTestUser();
      const anotherUserToken = anotherUser.token;
    
      // 다른 사용자의 알림 조회 시도 (권한 없음)
      const response = await testRequest
        .post(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .set('X-Test-Another-User', 'true'); // 테스트용 헤더 추가
    
      // 검증 - 테스트 환경에 관계없이 다른 사용자의 알림은 접근 불가
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
    
    it('이미 읽은 알림을 다시 읽음 처리해도 성공해야 합니다.', async () => {
      // 먼저 알림을 읽음 처리
      await testRequest
        .post(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${token}`);
        
      // 이미 읽은 알림을 다시 읽음 처리
      const response = await testRequest
        .post(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${token}`);
        
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });
  
  describe('DELETE /api/notifications/:id', () => {
    it('사용자가 자신의 알림을 삭제할 수 있어야 합니다.', async () => {
      const response = await testRequest
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('알림이 성공적으로 삭제되었습니다.');

      // DB에서 알림 삭제 확인
      const notification = await db.Notification.findByPk(notificationId);
      expect(notification).toBeNull();
    });

    it('존재하지 않는 알림 ID로 요청하면 404 응답을 반환해야 합니다.', async () => {
      const nonExistentId = 9999;
      const response = await testRequest
        .delete(`/api/notifications/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('다른 사용자의 알림을 삭제할 수 없어야 합니다.', async () => {
      // 다른 테스트 사용자 생성
      const anotherUser = await createTestUser();
      const anotherUserToken = anotherUser.token;
    
      // 첫 번째 사용자의 알림을 두 번째 사용자가 삭제 시도
      const response = await testRequest
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .set('X-Test-Another-User', 'true'); // 테스트용 헤더 추가
    
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/notifications/mark-all-read', () => {
    it('사용자가 자신의 모든 알림을 읽음 처리할 수 있어야 합니다.', async () => {
      // 추가 알림 생성
      await db.Notification.create({
        user_id: userId,
        content: '추가 테스트 알림',
        notification_type: 'system',
        is_read: false
      });

      const response = await testRequest
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('모든 알림이 읽음 처리되었습니다.');

      // DB에서 모든 알림이 읽음 처리됐는지 확인
      const notifications = await db.Notification.findAll({
        where: { 
          user_id: userId,
          is_read: false
        }
      });
      expect(notifications.length).toBe(0);
    });

    it('인증되지 않은 사용자는 알림을 읽음 처리할 수 없어야 합니다.', async () => {
      const response = await testRequest.post('/api/notifications/mark-all-read');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
    
    it('모든 알림이 이미 읽은 상태여도 성공 응답을 반환해야 합니다.', async () => {
      // 모든 알림을 읽음 처리
      await db.Notification.update(
        { is_read: true },
        { where: { user_id: userId } }
      );
      
      const response = await testRequest
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${token}`);
        
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });
  
  describe('알림 생성 및 전송 기능 테스트', () => {
    it('createNotification 함수가 올바르게 알림을 생성해야 합니다.', async () => {
      const initialCount = await db.Notification.count({
        where: { user_id: userId }
      });
      
      // 알림 생성
      const content = '새로운 테스트 알림';
      const type = 'system' as 'system'; // 타입 캐스팅 추가
      const relatedId = 123;
      
      await createNotification(userId, content, type, relatedId);
      
      // 알림이 생성되었는지 확인
      const newCount = await db.Notification.count({
        where: { user_id: userId }
      });
      expect(newCount).toBe(initialCount + 1);
      
      // 생성된 알림 내용 확인
      const notification = await db.Notification.findOne({
        where: {
          user_id: userId,
          content,
          notification_type: type,
          related_id: relatedId
        }
      });
      
      expect(notification).not.toBeNull();
      expect(notification?.get('is_read')).toBe(false);
    });
    
    it('관련 ID가 없는 알림도 생성할 수 있어야 합니다.', async () => {
      const content = '관련 ID 없는 알림';
      const type = 'system' as 'system'; // 타입 캐스팅 추가
      
      await createNotification(userId, content, type);
      
      const notification = await db.Notification.findOne({
        where: {
          user_id: userId,
          content,
          notification_type: type
        }
      });
      
      expect(notification).not.toBeNull();
      expect(notification?.get('related_id')).toBeNull();
    });
    
    it('여러 종류의 알림 타입이 정상적으로 생성되어야 합니다.', async () => {
      // 좋아요 알림
      await createNotification(userId, '좋아요 알림', 'like', 1);
      
      // 댓글 알림
      await createNotification(userId, '댓글 알림', 'comment', 2);
      
      // 챌린지 알림
      await createNotification(userId, '챌린지 알림', 'challenge', 3);
      
      // 각 타입별 알림이 있는지 확인
      const types = ['like', 'comment', 'challenge'] as const; // 상수 타입 배열로 선언
      
      for (const type of types) {
        const count = await db.Notification.count({
          where: {
            user_id: userId,
            notification_type: type
          }
        });
        
        expect(count).toBeGreaterThan(0);
      }
    });
  });
  
  describe('알림 집계 및 통계 테스트', () => {
    beforeEach(async () => {
      // 테스트를 위한 다양한 알림 생성
      const types = ['like', 'comment', 'challenge', 'system'] as const; // 상수 타입 배열로 선언
      const readStatus = [true, false];
      
      for (let i = 0; i < 20; i++) {
        const type = types[i % types.length];
        const isRead = readStatus[i % readStatus.length];
        
        await db.Notification.create({
          user_id: userId,
          content: `알림 타입: ${type}, 읽음: ${isRead}`,
          notification_type: type,
          is_read: isRead,
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // 날짜를 다르게
        });
      }
    });
    
    // ... 다른 테스트 코드 유지 ...
    
    it('최근 알림만 조회할 수 있어야 합니다.', async () => {
      // 최근 3일 기준으로 알림 조회
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const recentCount = await db.Notification.count({
        where: {
          user_id: userId,
          created_at: {
            [Op.gte]: threeDaysAgo
          }
        }
      });
      
      // 기간 내 알림이 있어야 함
      expect(recentCount).toBeGreaterThan(0);
      
      // 최근 알림만 필터링하는 API가 있다면 여기서 테스트 가능
    });
  });
});