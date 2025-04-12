// tests/integration/EncouragementMessage.test.ts
import db from '../../models';

describe('EncouragementMessage Integration Tests', () => {
  let userId1: number;
  let userId2: number;
  let postId: number;
  let messageId: number;
  
  // 테스트 전 필요한 데이터 설정
  beforeAll(async () => {
    const transaction = await db.sequelize.transaction();
    
    try {
      // 모든 관련 테이블의 데이터 삭제 (외래키 제약 고려)
      await db.EncouragementMessage.destroy({ where: {}, transaction });
      await db.SomeoneDayComment.destroy({ where: {}, transaction });
      await db.SomeoneDayLike.destroy({ where: {}, transaction });
      await db.SomeoneDayPost.destroy({ where: {}, transaction });
      await db.Challenge.destroy({ where: {}, transaction });
      await db.MyDayComment.destroy({ where: {}, transaction });
      await db.MyDayLike.destroy({ where: {}, transaction });
      await db.MyDayEmotion.destroy({ where: {}, transaction });
      await db.MyDayPost.destroy({ where: {}, transaction });
      await db.Notification.destroy({ where: {}, transaction });
      await db.EmotionLog.destroy({ where: {}, transaction });
      await db.UserStats.destroy({ where: {}, transaction });
      await db.User.destroy({ where: {}, transaction });
      // 테스트 사용자 생성
      const user1 = await db.User.create({
        username: 'testuser1',
        email: 'test1@example.com',
        password_hash: 'hashedpassword',
        nickname: 'testuser1',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        theme_preference: 'system',
        notification_settings: { 
          like_notifications: true, 
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        },
        privacy_settings: JSON.parse('{}') as JSON
      }, { transaction });
      
      const user2 = await db.User.create({
        username: 'testuser2',
        email: 'test2@example.com',
        password_hash: 'hashedpassword',
        nickname: 'testuser2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        theme_preference: 'system',
        notification_settings: { 
          like_notifications: true, 
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        },
        privacy_settings: JSON.parse('{}') as JSON
      }, { transaction });
      
      userId1 = user1.get('user_id');
      userId2 = user2.get('user_id');
      
      // 테스트 게시물 생성 (content 길이 조건 충족)
      const post = await db.SomeoneDayPost.create({
        user_id: userId1,
        title: '테스트 게시물',
        content: '이것은 충분한 길이의 테스트 게시물입니다. 최소 길이 요구사항을 충족시키기 위해 더 긴 내용을 작성하고 있습니다.',
        is_anonymous: false,
        like_count: 0,
        comment_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });
      
      postId = post.get('post_id');
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  });
// 테스트 후 데이터 정리
afterAll(async () => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // 모든 관련 테이블의 데이터 삭제 (외래키 제약 고려)
    await db.EncouragementMessage.destroy({ where: {}, transaction });
    await db.SomeoneDayComment.destroy({ where: {}, transaction });
    await db.SomeoneDayLike.destroy({ where: {}, transaction });
    await db.SomeoneDayPost.destroy({ where: {}, transaction });
    await db.Challenge.destroy({ where: {}, transaction });
    await db.MyDayComment.destroy({ where: {}, transaction });
    await db.MyDayLike.destroy({ where: {}, transaction });
    await db.MyDayEmotion.destroy({ where: {}, transaction });
    await db.MyDayPost.destroy({ where: {}, transaction });
    await db.Notification.destroy({ where: {}, transaction });
    await db.EmotionLog.destroy({ where: {}, transaction });
    await db.UserStats.destroy({ where: {}, transaction });
    await db.User.destroy({ where: {}, transaction });
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error('데이터 정리 중 오류:', error);
  }
});
  // 익명 메시지 생성 테스트
  test('익명 격려 메시지 생성', async () => {
    const message = await db.EncouragementMessage.create({
      sender_id: userId2,
      receiver_id: userId1,
      post_id: postId,
      message: '익명으로 응원합니다!',
      is_anonymous: true,
      created_at: new Date()
    });
    
    messageId = message.get('message_id');
    expect(message).toBeDefined();
    expect(message.get('is_anonymous')).toBe(true);
  });
  
  // 메시지 조회 시 익명 메시지 처리 테스트
  test('익명 메시지 조회 시 발신자 정보 숨김', async () => {
    const message = await db.EncouragementMessage.findByPk(messageId, {
      include: [{
        model: db.User,
        as: 'sender',
        attributes: ['user_id', 'nickname']
      }]
    });
    
    expect(message).toBeDefined();
    
    // JSON 변환하여 익명 처리 확인
    const jsonData = message!.toJSON();
    expect(jsonData).not.toHaveProperty('sender_id');
    expect(jsonData).not.toHaveProperty('sender');
    expect(jsonData).toHaveProperty('message');
    expect(jsonData.message).toBe('익명으로 응원합니다!');
  });
  
  // 일반 메시지(익명 아님) 테스트
  test('비익명 메시지 조회 시 발신자 정보 표시', async () => {
    const message = await db.EncouragementMessage.create({
      sender_id: userId2,
      receiver_id: userId1,
      post_id: postId,
      message: '공개적으로 응원합니다!',
      is_anonymous: false,
      created_at: new Date()
    });
    
    const retrievedMessage = await db.EncouragementMessage.findByPk(message.get('message_id'), {
      include: [{
        model: db.User,
        as: 'sender',
        attributes: ['user_id', 'nickname']
      }]
    });
    
    // JSON 변환하여 정보 유지 확인
    const jsonData = retrievedMessage!.toJSON();
    expect(jsonData).toHaveProperty('sender_id');
    expect(jsonData).toHaveProperty('sender');
    expect(jsonData.sender_id).toBe(userId2);
  });
});