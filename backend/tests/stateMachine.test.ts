// tests/stateMachine.test.ts
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
import db from '../models';
import { sequelize } from '../server';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import PostReport, { ReportStatus, ReportType } from '../models/PostReport';

// JWT 토큰 생성 유틸리티 함수
const generateToken = (userId: number): string => {
  return jwt.sign({ user_id: userId }, process.env.JWT_SECRET || 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=');
};

// 테스트를 위한 가상 사용자 데이터
// 기본 테스트 사용자 템플릿
const createTestUser = (index: number, timestamp: number = Date.now()) => ({
  username: `testuser${index}_${timestamp}`,
  email: `test${index}_${timestamp}@example.com`,
  password_hash: '$2a$10$XFrjBMZ1Cvyj3oY.9tcEGer.rtDnRTrLXUG9YNZcJUcwX7MJXPkVm', // 'password123'
  nickname: `테스트유저${index}`,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  notification_settings: {
    like_notifications: true,
    comment_notifications: true,
    challenge_notifications: true,
    encouragement_notifications: true
  },
  theme_preference: 'system',
  privacy_settings: {}
});

describe('상태 관리 테스트', () => {
  let user1Id: number;
  let user2Id: number;
  let postId: number;
  
  // 테스트 전 데이터베이스 연결 확인
  beforeAll(async () => {
    try {
      await sequelize.authenticate();
      console.log('테스트 데이터베이스 연결 성공');
    } catch (error) {
      console.error('테스트 데이터베이스 연결 실패:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      // 테이블 초기화를 위한 직접 SQL 쿼리 실행
      // 기존 데이터를 삭제하고 자동 증가 ID를 리셋
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      await sequelize.query('TRUNCATE TABLE users;');
      await sequelize.query('TRUNCATE TABLE someone_day_posts;');
      await sequelize.query('TRUNCATE TABLE post_reports;');
      await sequelize.query('TRUNCATE TABLE challenges;');
      await sequelize.query('TRUNCATE TABLE challenge_participants;');
      await sequelize.query('TRUNCATE TABLE someone_day_likes;');
      await sequelize.query('TRUNCATE TABLE notifications;');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      
      // 테스트용 고유 사용자 생성
      const timestamp = Date.now();
      
      // 사용자 데이터 정의
// tests/stateMachine.test.ts
// tests/stateMachine.test.ts
const userData1 = {
    username: `testuser1_${timestamp}`,
    email: `test1_${timestamp}@example.com`,
    password_hash: '$2a$10$XFrjBMZ1Cvyj3oY.9tcEGer.rtDnRTrLXUG9YNZcJUcwX7MJXPkVm',
    nickname: '테스트유저1',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    notification_settings: {
      like_notifications: true,
      comment_notifications: true,
      challenge_notifications: true,
      encouragement_notifications: true
    },
    theme_preference: 'system' as const,
    privacy_settings: JSON.parse('{}') // JSON 객체로 변환
  };
  
  const userData2 = {
    username: `testuser2_${timestamp}`,
    email: `test2_${timestamp}@example.com`,
    password_hash: '$2a$10$XFrjBMZ1Cvyj3oY.9tcEGer.rtDnRTrLXUG9YNZcJUcwX7MJXPkVm',
    nickname: '테스트유저2',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    notification_settings: {
      like_notifications: true,
      comment_notifications: true,
      challenge_notifications: true,
      encouragement_notifications: true
    },
    theme_preference: 'system' as const,
    privacy_settings: JSON.parse('{}') // JSON 객체로 변환
  };
      
      // 테스트 사용자 생성
      const createdUser1 = await User.create(userData1);
      const createdUser2 = await User.create(userData2);
      user1Id = createdUser1.user_id;
      user2Id = createdUser2.user_id;
      
      // 테스트용 게시물 생성
      const post = await db.SomeoneDayPost.create({
        user_id: user1Id,
        title: '테스트 게시물',
        content: '이것은 테스트 게시물입니다. 내용은 20자 이상이어야 합니다.',
        is_anonymous: false,
        like_count: 0,
        comment_count: 0
      });
      
      postId = post.get('post_id');
    } catch (error) {
      console.error('테스트 설정 중 오류 발생:', error);
      throw error;
    }
  });

  afterEach(async () => {
    // 테스트 후 정리
    jest.clearAllMocks();
  });
  
  // 모든 테스트 완료 후 연결 정리
  afterAll(async () => {
    // 데이터베이스 연결 종료
    await sequelize.close();
    console.log('테스트 데이터베이스 연결 종료');
  });

  it('신고 상태 변경 테스트', async () => {
    // 게시물 신고 생성
    const report = await PostReport.create({
      report_id: 1, // 명시적 ID 설정
      post_id: postId,
      reporter_id: user2Id,
      report_type: ReportType.INAPPROPRIATE,
      description: '부적절한 내용이 포함되어 있습니다.',
      status: ReportStatus.PENDING
    });
    
    expect(report.status).toBe(ReportStatus.PENDING);
    
    // 상태 변경: 검토 중
    await report.update({ status: ReportStatus.REVIEWED });
    expect(report.status).toBe(ReportStatus.REVIEWED);
    
    // 상태 변경: 해결됨
    await report.update({ status: ReportStatus.RESOLVED });
    expect(report.status).toBe(ReportStatus.RESOLVED);
    
    // 데이터베이스에서 다시 조회하여 상태 확인
    const updatedReport = await PostReport.findByPk(report.report_id);
    expect(updatedReport?.status).toBe(ReportStatus.RESOLVED);
  });

  it('챌린지 참여 상태 변경 테스트', async () => {
    // 챌린지 생성
    const challenge = await db.Challenge.create({
      creator_id: user1Id,
      title: '테스트 챌린지',
      description: '테스트 챌린지 설명',
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 일주일 후
      is_public: true,
      participant_count: 1
    });
    
    // 초기 참여자 카운트 확인
    expect(challenge.get('participant_count')).toBe(1);
    
    // 다른 사용자가 챌린지에 참여
    await db.ChallengeParticipant.create({
      challenge_id: challenge.get('challenge_id'),
      user_id: user2Id
    });
    
    // 참여자 카운트 업데이트
    await challenge.increment('participant_count');
    await challenge.reload();
    
    // 참여자 카운트 증가 확인
    expect(challenge.get('participant_count')).toBe(2);
    
    // 사용자가 챌린지에서 탈퇴
    await db.ChallengeParticipant.destroy({
      where: {
        challenge_id: challenge.get('challenge_id'),
        user_id: user2Id
      }
    });
    
    // 참여자 카운트 감소
    await challenge.decrement('participant_count');
    await challenge.reload();
    
    // 참여자 카운트 감소 확인
    expect(challenge.get('participant_count')).toBe(1);
  });

  it('게시물 좋아요 상태 변경 테스트', async () => {
    // 게시물 초기 좋아요 카운트 확인
    const post = await db.SomeoneDayPost.findByPk(postId);
    expect(post?.get('like_count')).toBe(0);
    
    // 사용자가 게시물에 좋아요 표시
    await db.SomeoneDayLike.create({
      id: 1, // id를 명시적으로 추가
      post_id: postId,
      user_id: user2Id
    });
    
    // 좋아요 카운트 증가
    await post?.increment('like_count');
    await post?.reload();
    
    // 좋아요 카운트 증가 확인
    expect(post?.get('like_count')).toBe(1);
    
    // 좋아요 상태 확인
    const like = await db.SomeoneDayLike.findOne({
      where: {
        post_id: postId,
        user_id: user2Id
      }
    });
    expect(like).not.toBeNull();
    
    // 사용자가 좋아요 취소
    await like?.destroy();
    
    // 좋아요 카운트 감소
    await post?.decrement('like_count');
    await post?.reload();
    
    // 좋아요 카운트 감소 확인
    expect(post?.get('like_count')).toBe(0);
  });

  it('알림 읽음 상태 변경 테스트', async () => {
    // 알림 생성
    const notification = await db.Notification.create({
      id: 1, // 명시적 ID 설정
      user_id: user1Id,
      content: '새로운 댓글이 작성되었습니다.',
      notification_type: 'comment',
      related_id: postId,
      is_read: false
    });
    
    // 초기 읽음 상태 확인
    expect(notification.get('is_read')).toBe(false);
    
    // 읽음 상태로 변경
    await notification.update({ is_read: true });
    
    // 변경된 읽음 상태 확인
    expect(notification.get('is_read')).toBe(true);
    
    // 데이터베이스에서 다시 조회하여 상태 확인
    const updatedNotification = await db.Notification.findByPk(notification.get('id'));
    expect(updatedNotification?.get('is_read')).toBe(true);
  });

  it('사용자 활성 상태 변경 테스트', async () => {
    // 사용자 조회
    const user = await User.findByPk(user1Id);
    expect(user?.is_active).toBe(true);
    
    // 사용자 비활성화
    await user?.update({ is_active: false });
    
    // 변경된 활성 상태 확인
    expect(user?.is_active).toBe(false);
    
    // 데이터베이스에서 다시 조회하여 상태 확인
    const updatedUser = await User.findByPk(user1Id);
    expect(updatedUser?.is_active).toBe(false);
    
    // 사용자 다시 활성화
    await updatedUser?.update({ is_active: true });
    expect(updatedUser?.is_active).toBe(true);
  });
});