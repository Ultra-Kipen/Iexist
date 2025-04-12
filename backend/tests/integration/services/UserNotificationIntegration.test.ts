import { sequelize, User, Notification, MyDayPost, MyDayLike, MyDayComment } from '../../../models';
import { Op } from 'sequelize';
import { createTestUser } from '../../helpers/db.helper';

describe('사용자와 알림 서비스 통합 테스트', () => {
  let userId: number;
  let otherUserId: number;
  let postId: number;
  
  // 각 테스트 전에 데이터를 설정합니다
  beforeEach(async () => {
    // 테스트 데이터베이스 초기화 확인
    try {
      // 기존 데이터 정리
      await sequelize.transaction(async (transaction) => {
        await Notification.destroy({ where: {}, transaction });
        await MyDayComment.destroy({ where: {}, transaction });
        await MyDayLike.destroy({ where: {}, transaction });
        await MyDayPost.destroy({ where: {}, transaction });
      });
      
      // 테스트 사용자 생성
      const timestamp = Date.now();
      const user = await createTestUser({
        username: `notification_test_user_${timestamp}`,
        email: `notification_test_${timestamp}@example.com`,
        password_hash: 'password123',
        nickname: `NotificationTest_${timestamp}`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        notification_settings: {
          like_notifications: true,
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        },
        privacy_settings: {}
      });
      
      userId = user.user_id;
      
      // 다른 테스트 사용자 생성
      const otherUser = await createTestUser({
        username: `notification_test_other_${timestamp}`,
        email: `notification_other_${timestamp}@example.com`,
        password_hash: 'password123',
        nickname: `OtherUser_${timestamp}`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        notification_settings: {
          like_notifications: true,
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        },
        privacy_settings: {}
      });
      
      otherUserId = otherUser.user_id;
      
      // 테스트 게시물 생성
      const post = await MyDayPost.create({
        user_id: userId,
        content: '알림 테스트 게시물',
        is_anonymous: false,
        character_count: 20,
        like_count: 0,
        comment_count: 0
      });
      
      postId = post.get('post_id');
    } catch (error) {
      console.error('테스트 데이터 설정 오류:', error);
      throw error;
    }
  });

  // 각 테스트 후에 데이터를 정리합니다
  afterEach(async () => {
    try {
      // 트랜잭션 없이 순서대로 삭제
      await Notification.destroy({ where: {} });
      await MyDayComment.destroy({ where: {} });
      await MyDayLike.destroy({ where: {} });
      await MyDayPost.destroy({ where: {} });
      // User 삭제는 외래 키 제약 조건 때문에 건너뜁니다
      // 테스트 DB는 매 실행마다 초기화됩니다
    } catch (error) {
      console.error('테스트 데이터 정리 오류:', error);
    }
  });

  // 모든 테스트가 끝난 후 연결을 닫습니다
  afterAll(async () => {
    await sequelize.close();
  });

  it('좋아요 알림 생성 및 조회 테스트', async () => {
    const transaction = await sequelize.transaction();
    try {
      // 다른 사용자가 게시물에 좋아요
      await MyDayLike.create({
        user_id: otherUserId,
        post_id: postId
      }, { transaction });
      
      // 게시물 좋아요 수 증가
      await MyDayPost.increment('like_count', {
        by: 1,
        where: { post_id: postId },
        transaction
      });
      
      // 알림 생성
      const notification = await Notification.create({
        user_id: userId,
        content: '회원님의 게시물에 새로운 좋아요가 추가되었습니다.',
        notification_type: 'like',
        related_id: postId,
        is_read: false,
        created_at: new Date()
      }, { transaction });
      
      // 알림 조회
      const notifications = await Notification.findAll({
        where: { 
          user_id: userId,
          notification_type: 'like'
        },
        order: [['created_at', 'DESC']],
        transaction
      });
      
      expect(notifications).not.toBeNull();
      expect(notifications.length).toBeGreaterThanOrEqual(1);
      expect(notifications[0].notification_type).toBe('like');
      expect(notifications[0].is_read).toBe(false);
      
      // 알림 읽음 표시
      await notifications[0].update({ is_read: true }, { transaction });
      
      // 알림 상태 확인
      const updatedNotification = await Notification.findByPk(notifications[0].id, { transaction });
      expect(updatedNotification).not.toBeNull();
      expect(updatedNotification?.is_read).toBe(true);
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  });

  it('댓글 알림 생성 및 삭제 테스트', async () => {
    const transaction = await sequelize.transaction();
    try {
      // 댓글 작성
      const comment = await MyDayComment.create({
        post_id: postId,
        user_id: otherUserId,
        content: '알림 테스트 댓글입니다.',
        is_anonymous: false,
        created_at: new Date()
        // updated_at 필드 제거 (모델에서 자동으로 관리할 가능성이 높음)
      }, { transaction });
      
      // 게시물 댓글 수 증가
      await MyDayPost.increment('comment_count', {
        by: 1,
        where: { post_id: postId },
        transaction
      });
      
      // 알림 생성
      const notification = await Notification.create({
        user_id: userId,
        content: '회원님의 게시물에 새로운 댓글이 달렸습니다.',
        notification_type: 'comment',
        related_id: Number(comment.get('comment_id')),
        is_read: false,
        created_at: new Date()
      }, { transaction });
      
      // 알림 조회
      const commentNotifications = await Notification.findAll({
        where: { 
          user_id: userId,
          notification_type: 'comment'
        },
        order: [['created_at', 'DESC']],
        transaction
      });
      
      expect(commentNotifications).not.toBeNull();
      expect(commentNotifications.length).toBeGreaterThanOrEqual(1);
      
      // 알림 삭제
      const deleteResult = await Notification.destroy({
        where: { id: commentNotifications[0].id },
        transaction
      });
      
      expect(deleteResult).toBe(1);
      
      // 삭제된 알림 확인
      const deletedNotification = await Notification.findByPk(commentNotifications[0].id, { transaction });
      expect(deletedNotification).toBeNull();
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('테스트 중 오류 발생:', error);
      throw error;
    }
  });

  it('알림 설정에 따른 생성 테스트', async () => {
    const transaction = await sequelize.transaction();
    try {
      // 사용자가 있는지 확인
      const userExists = await User.findByPk(userId, { transaction });
      if (!userExists) {
        throw new Error(`사용자(ID: ${userId})를 찾을 수 없습니다.`);
      }
      
      // 알림 설정 변경 (좋아요 알림 비활성화)
      const notificationSettings = {
        like_notifications: false,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      };
      
      await User.update(
        { notification_settings: notificationSettings },
        { 
          where: { user_id: userId },
          transaction
        }
      );
      
      // 알림 설정 확인
      const updatedUser = await User.findByPk(userId, { transaction });
      expect(updatedUser).not.toBeNull();
      
      // notification_settings가 정의되어 있는지 확인
      expect(updatedUser?.notification_settings).toBeDefined();
      
      // JSON 문자열인 경우 파싱
      const settings = typeof updatedUser?.notification_settings === 'string' 
        ? JSON.parse(updatedUser.notification_settings)
        : updatedUser?.notification_settings;
      
      // like_notifications가 false인지 확인
      expect(settings?.like_notifications).toBe(false);
      
      // 알림 설정 원복
      await User.update(
        { 
          notification_settings: {
            like_notifications: true,
            comment_notifications: true,
            challenge_notifications: true,
            encouragement_notifications: true
          }
        },
        { 
          where: { user_id: userId },
          transaction
        }
      );
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  });
});