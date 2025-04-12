import { db } from '../../tests/setup';
import { Transaction } from 'sequelize';

describe('Transaction Tests', () => {
  let transaction: Transaction | null;

  beforeEach(async () => {
    // 각 테스트 전에 새 트랜잭션 시작
    transaction = await db.sequelize.transaction();
  });

  afterEach(async () => {
    // 각 테스트 후 트랜잭션 롤백 (테스트 데이터가 DB에 남지 않도록)
    if (transaction) await transaction.rollback();
  });

  it('should successfully commit transaction', async () => {
    try {
      // 테스트 유저 생성
      const now = new Date();
      const uniqueSuffix = Date.now();
      
      const testUser = await db.User.create({
        username: `transaction_test_user_${uniqueSuffix}`,
        email: `transaction_test_${uniqueSuffix}@example.com`,
        password_hash: 'hashedpassword123',
        nickname: `TestUser${uniqueSuffix}`,
        is_active: true,
        created_at: now,
        updated_at: now,
        notification_settings: {
          like_notifications: true,
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        }
      }, { transaction });

      // 트랜잭션 커밋
      if (transaction) {
        await transaction.commit();
        transaction = null; // afterEach에서 롤백하지 않도록
      }

      // 커밋 후 데이터가 존재하는지 확인
      const foundUser = await db.User.findOne({
        where: { email: `transaction_test_${uniqueSuffix}@example.com` }
      });

      expect(foundUser).not.toBeNull();
      expect(foundUser?.get('username')).toBe(`transaction_test_user_${uniqueSuffix}`);

      // 테스트 후 데이터 정리
      if (foundUser) {
        await foundUser.destroy();
      }
    } catch (error) {
      // 트랜잭션이 아직 활성 상태라면 롤백
      if (transaction) await transaction.rollback();
      throw error;
    }
  });

  it('should successfully rollback transaction on error', async () => {
    try {
      // 테스트 유저 생성
      const uniqueSuffix = Date.now();
      const testUser = await db.User.create({
        username: `rollback_test_user_${uniqueSuffix}`,
        email: `rollback_test_${uniqueSuffix}@example.com`,
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

      // 사용자 ID 확인
      const userId = testUser.get('user_id');
      expect(userId).toBeDefined();

      // 의도적으로 트랜잭션 롤백
      if (transaction) {
        await transaction.rollback();
        transaction = null; // afterEach에서 다시 롤백하지 않도록
      }

      // 롤백 후 데이터가 존재하지 않는지 확인
      const foundUser = await db.User.findOne({
        where: { email: `rollback_test_${uniqueSuffix}@example.com` }
      });

      expect(foundUser).toBeNull();
    } catch (error) {
      // 트랜잭션이 아직 활성 상태라면 롤백
      if (transaction) await transaction.rollback();
      throw error;
    }
  });
});