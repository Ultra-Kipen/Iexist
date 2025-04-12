import { db } from '../../tests/setup';
import { Transaction } from 'sequelize';

describe('Error Handling Tests', () => {
  let transaction: Transaction | null;

  beforeEach(async () => {
    transaction = await db.sequelize.transaction();
  });

  afterEach(async () => {
    if (transaction) await transaction.rollback();
  });

  it('should handle constraint violations', async () => {
    try {
      const uniqueSuffix = Date.now();
      
      // 첫 번째 사용자 생성
      const testUser1 = await db.User.create({
        username: `constraint_test_user_${uniqueSuffix}`,
        email: `constraint_test_${uniqueSuffix}@example.com`,
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

      // 같은 이메일로 두 번째 사용자 생성 시도 (고유 제약조건 위반)
      let errorOccurred = false;
      try {
        const testUser2 = await db.User.create({
          username: `constraint_test_user2_${uniqueSuffix}`,
          email: `constraint_test_${uniqueSuffix}@example.com`, // 중복 이메일
          password_hash: 'anotherhashedpassword123',
          nickname: `TestUser2${uniqueSuffix}`,
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
      } catch (error) {
        errorOccurred = true;
      }

      expect(errorOccurred).toBe(true);

      // 트랜잭션 롤백 - null 체크 추가
      if (transaction) {
        await transaction.rollback();
        transaction = null;
      }

      // 롤백 후 첫 번째 사용자도 생성되지 않았는지 확인
      const foundUser = await db.User.findOne({
        where: { email: `constraint_test_${uniqueSuffix}@example.com` }
      });

      expect(foundUser).toBeNull();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  });

  it('should handle foreign key violations', async () => {
    try {
      // 존재하지 않는 사용자 ID로 게시물 생성 시도 (외래 키 제약조건 위반)
      let errorOccurred = false;
      try {
        const invalidPost = await db.MyDayPost.create({
          user_id: 9999999, // 존재하지 않는 ID
          content: '외래 키 테스트 게시물',
          is_anonymous: false,
          like_count: 0,
          comment_count: 0
        }, { transaction });
      } catch (error) {
        errorOccurred = true;
      }

      expect(errorOccurred).toBe(true);

      // 트랜잭션 롤백 - null 체크 추가
      if (transaction) {
        await transaction.rollback();
        transaction = null;
      }
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  });
  
  it('should handle transaction retry when encountering deadlocks', async () => {
    // 데드락 발생을 시뮬레이션하기 위한 최대 재시도 횟수
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let success = false;
    
    // 트랜잭션 재시도 함수
    const executeWithRetry = async () => {
      while (retryCount < MAX_RETRIES && !success) {
        let localTransaction = null;
        
        try {
          localTransaction = await db.sequelize.transaction();
          retryCount++;
          
          // 테스트 데이터 생성
          const uniqueSuffix = Date.now() + retryCount;
          await db.User.create({
            username: `retry_test_user_${uniqueSuffix}`,
            email: `retry_test_${uniqueSuffix}@example.com`,
            password_hash: 'hashedpassword123',
            nickname: `RetryUser${uniqueSuffix}`,
            is_active: true,
            notification_settings: {
              like_notifications: true,
              comment_notifications: true,
              challenge_notifications: true,
              encouragement_notifications: true
            },
            created_at: new Date(),
            updated_at: new Date()
          }, { transaction: localTransaction });
          
          // 첫번째 시도에서 의도적으로 오류 발생
          if (retryCount === 1) {
            throw new Error('시뮬레이션된 데드락 오류');
          }
          
          // 트랜잭션 커밋
          await localTransaction.commit();
          success = true;
        } catch (error) {
          console.log(`시도 ${retryCount}: 오류 발생, 재시도 중...`);
          if (localTransaction) {
            await localTransaction.rollback();
          }
          
          // 마지막 시도에서도 실패한 경우 오류 던지기
          if (retryCount >= MAX_RETRIES) {
            throw error;
          }
          // 그렇지 않으면 다음 반복으로 계속 진행
        }
      }
    };
    
    await executeWithRetry();
    
    // 결과 확인
    expect(retryCount).toBeGreaterThan(1);
    expect(success).toBe(true);
  });
});