import { db } from '../../tests/setup';
import { Transaction } from 'sequelize';

describe('Complex Transaction Tests', () => {
  let transaction: Transaction | null;
  let transactionFinished = false;

  beforeEach(async () => {
    transaction = await db.sequelize.transaction();
    transactionFinished = false;
  });

  afterEach(async () => {
    // 트랜잭션이 아직 활성 상태인 경우에만 롤백
    if (transaction && !transactionFinished) {
      try {
        await transaction.rollback();
      } catch (error) {
        console.log('트랜잭션 롤백 중 오류가 발생했습니다:', error);
      }
    }
  });

  it('should rollback all operations when one fails', async () => {
    try {
      const uniqueSuffix = Date.now();
      
      // 1. 사용자 생성
      const testUser = await db.User.create({
        username: `complex_test_user_${uniqueSuffix}`,
        email: `complex_test_${uniqueSuffix}@example.com`,
        password_hash: 'hashedpassword123',
        nickname: `TestUser${uniqueSuffix}`,
        is_active: true,
        notification_settings: {
          like_notifications: true,
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        },
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      // 2. 게시물 생성
      const post = await db.MyDayPost.create({
        user_id: testUser.get('user_id'),
        content: '복합 트랜잭션 테스트 게시물',
        is_anonymous: false,
        like_count: 0,
        comment_count: 0
      }, { transaction });

      // 3. 의도적으로 오류 발생 - 존재하지 않는 emotion_id
      try {
        await db.MyDayEmotion.create({
          post_id: post.get('post_id'),
          emotion_id: 99999 // 존재하지 않는 ID
        }, { transaction });
        fail('외래 키 제약 조건 오류가 발생해야 합니다');
      } catch (error) {
        // 트랜잭션 롤백
        if (transaction) {
          await transaction.rollback();
          transactionFinished = true;
          transaction = null; // afterEach에서 다시 롤백하지 않도록
        }
      }

      // 롤백 후 데이터가 존재하지 않는지 확인
      const foundUser = await db.User.findOne({
        where: { email: `complex_test_${uniqueSuffix}@example.com` }
      });
      
      const foundPost = await db.MyDayPost.findOne({
        where: { user_id: testUser.get('user_id') }
      });

      expect(foundUser).toBeNull();
      expect(foundPost).toBeNull();
    } catch (error) {
      if (transaction && !transactionFinished) {
        await transaction.rollback();
        transactionFinished = true;
      }
      throw error;
    }
  });

  it('should handle multiple operations in a single transaction', async () => {
    try {
      const uniqueSuffix = Date.now();
      
      // 1. 테스트 감정 데이터 확인하고 없으면 생성
      let emotion = await db.Emotion.findOne({
        where: { emotion_id: 1 }, // 행복
        transaction
      });
      
      // 감정 데이터가 없으면 생성
      if (!emotion) {
        emotion = await db.Emotion.create({
          emotion_id: 1,
          name: '행복',
          icon: 'emoticon-happy-outline',
          color: '#FFD700'
        }, { transaction });
        
        console.log('감정 데이터 생성됨:', emotion.get('name'));
      }
  
      // 2. 사용자 생성
      const testUser = await db.User.create({
        username: `multiop_test_user_${uniqueSuffix}`,
        email: `multiop_test_${uniqueSuffix}@example.com`,
        password_hash: 'hashedpassword123',
        nickname: `TestUser${uniqueSuffix}`,
        is_active: true,
        notification_settings: {
          like_notifications: true,
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        },
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });
  
      // 3. 게시물 생성
      const post = await db.MyDayPost.create({
        user_id: testUser.get('user_id'),
        content: '복합 트랜잭션 테스트 게시물',
        is_anonymous: false,
        like_count: 0,
        comment_count: 0
      }, { transaction });
  
      // 4. 게시물에 감정 연결
      await db.MyDayEmotion.create({
        post_id: post.get('post_id'),
        emotion_id: emotion.get('emotion_id')
      }, { transaction });
  
      // 5. 트랜잭션 커밋
      if (transaction) {
        await transaction.commit();
        transactionFinished = true;
        transaction = null;
      }
  
      // 6. 데이터 확인
      const foundPost = await db.MyDayPost.findOne({
        where: { user_id: testUser.get('user_id') },
        include: [{
          model: db.Emotion,
          as: 'emotions'
        }]
      });
  
      expect(foundPost).not.toBeNull();
      expect(foundPost?.get('content')).toBe('복합 트랜잭션 테스트 게시물');
      
      const emotions = foundPost?.get('emotions') as any[];
      expect(Array.isArray(emotions)).toBe(true);
      expect(emotions.length).toBeGreaterThanOrEqual(1);
  
   // 7. 테스트 후 데이터 정리
await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

await db.MyDayEmotion.destroy({
  where: { post_id: post.get('post_id') },
  force: true
});

await db.MyDayPost.destroy({
  where: { user_id: testUser.get('user_id') },
  force: true
});

await db.User.destroy({
  where: { email: `multiop_test_${uniqueSuffix}@example.com` },
  force: true
});

await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      if (transaction && !transactionFinished) {
        await transaction.rollback();
        transactionFinished = true;
      }
      throw error;
    }
  });
});