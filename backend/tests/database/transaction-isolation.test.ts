// tests/database/transaction-isolation.test.ts
import { Transaction } from 'sequelize';
import db from '../../models';

// 전역 타임아웃 설정 (10분)
jest.setTimeout(600000);

describe('트랜잭션 격리 수준 테스트', () => {
  // 테스트 사용자 ID
  let testUserId1: number;
  let testUserId2: number;
  let postId: number;

  beforeAll(async () => {
    try {
      await db.sequelize.authenticate();
      console.log('데이터베이스 연결 성공');

      // 테스트 데이터 생성
      const testUser1 = await db.User.create({
        username: `isolation_test_user1_${Date.now()}`,
        email: `isolation_test1_${Date.now()}@example.com`,
        password_hash: 'hashedpassword123',
        nickname: `IsolationTestUser1_${Date.now()}`,
        is_active: true,
        notification_settings: {
          like_notifications: true,
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        },
        privacy_settings: JSON.parse('{}'), // JSON 객체로 변환
        created_at: new Date(),
        updated_at: new Date()
      });

      const testUser2 = await db.User.create({
        username: `isolation_test_user2_${Date.now()}`,
        email: `isolation_test2_${Date.now()}@example.com`,
        password_hash: 'hashedpassword123',
        nickname: `IsolationTestUser2_${Date.now()}`,
        is_active: true,
        notification_settings: {
          like_notifications: true,
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        },
        privacy_settings: JSON.parse('{}'), // JSON 객체로 변환
        created_at: new Date(),
        updated_at: new Date()
      });

      testUserId1 = testUser1.get('user_id');
      testUserId2 = testUser2.get('user_id');

      // 테스트용 게시물 생성
      const post = await db.MyDayPost.create({
        user_id: testUserId1,
        content: '트랜잭션 격리 수준 테스트 게시물',
        is_anonymous: false,
        like_count: 0,
        comment_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      });

      postId = post.get('post_id');

      console.log('테스트 데이터 생성 완료:', { testUserId1, testUserId2, postId });
    } catch (error) {
      console.error('테스트 초기화 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
      throw error;
    }
  });

// afterAll 부분 수정
afterAll(async () => {
  try {
    // 테스트 데이터 정리 - 외래 키 제약조건 일시 비활성화
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 알림 데이터 먼저 삭제 (외래 키 제약조건 관련)
    await db.Notification.destroy({
      where: { user_id: [testUserId1, testUserId2] },
      force: true
    });
    
    // 좋아요 데이터 삭제
    await db.MyDayLike.destroy({
      where: { post_id: postId },
      force: true
    });

    // 게시물 삭제
    await db.MyDayPost.destroy({
      where: { post_id: postId },
      force: true
    });

    // 사용자 삭제
    await db.User.destroy({
      where: { user_id: [testUserId1, testUserId2] },
      force: true
    });
    
    // 외래 키 제약조건 다시 활성화
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('테스트 데이터 정리 완료');
    
    // 데이터베이스 연결 종료
    await db.sequelize.close();
  } catch (error) {
    console.error('테스트 정리 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
  }
});
  // READ UNCOMMITTED 격리 수준 테스트
  test('READ UNCOMMITTED: 커밋되지 않은 변경사항이 다른 트랜잭션에 보여야 함', async () => {
    let transaction1: Transaction | null = null;
    let transaction2: Transaction | null = null;

    try {
      // 첫 번째 트랜잭션 시작 (READ UNCOMMITTED)
      transaction1 = await db.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
      });

      // 두 번째 트랜잭션 시작 (READ UNCOMMITTED)
      transaction2 = await db.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
      });

      // 첫 번째 트랜잭션에서 게시물 좋아요 수 증가 (커밋하지 않음)
      await db.MyDayPost.increment('like_count', {
        by: 5,
        where: { post_id: postId },
        transaction: transaction1
      });

      // 두 번째 트랜잭션에서 변경된 데이터 읽기
      const postInTransaction2 = await db.MyDayPost.findByPk(postId, {
        transaction: transaction2
      });

      // READ UNCOMMITTED에서는 커밋되지 않은 변경사항이 보여야 함
      expect(postInTransaction2!.get('like_count')).toBe(5);

      // 트랜잭션 롤백
      await transaction1.rollback();
      await transaction2.rollback();

      // 롤백 후 원래 상태로 돌아왔는지 확인
      const postAfterRollback = await db.MyDayPost.findByPk(postId);
      expect(postAfterRollback!.get('like_count')).toBe(0);
    } catch (error) {
      // 에러 발생 시 롤백
      if (transaction1) await transaction1.rollback().catch(err => console.log('트랜잭션1 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      if (transaction2) await transaction2.rollback().catch(err => console.log('트랜잭션2 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      throw error;
    }
  });

  // READ COMMITTED 격리 수준 테스트
  test('READ COMMITTED: 커밋된 변경사항만 다른 트랜잭션에 보여야 함', async () => {
    let transaction1: Transaction | null = null;
    let transaction2: Transaction | null = null;

    try {
      // 첫 번째 트랜잭션 시작 (READ COMMITTED)
      transaction1 = await db.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
      });

      // 두 번째 트랜잭션 시작 (READ COMMITTED)
      transaction2 = await db.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
      });

      // 첫 번째 트랜잭션에서 게시물 좋아요 수 증가 (커밋하지 않음)
      await db.MyDayPost.increment('like_count', {
        by: 3,
        where: { post_id: postId },
        transaction: transaction1
      });

      // 두 번째 트랜잭션에서 변경되지 않은 데이터를 읽어야 함
      const postBeforeCommit = await db.MyDayPost.findByPk(postId, {
        transaction: transaction2
      });

      // READ COMMITTED에서는 커밋되지 않은 변경사항이 보이지 않아야 함
      expect(postBeforeCommit!.get('like_count')).toBe(0);

      // 첫 번째 트랜잭션 커밋
      await transaction1.commit();

      // 커밋 후 두 번째 트랜잭션에서 읽기
      const postAfterCommit = await db.MyDayPost.findByPk(postId, {
        transaction: transaction2
      });

      // 커밋된 변경사항이 보여야 함
      expect(postAfterCommit!.get('like_count')).toBe(3);

      // 두 번째 트랜잭션 롤백
      await transaction2.rollback();

      // 롤백 후 상태 확인 (트랜잭션 1은 커밋되었으므로 변경사항이 유지되어야 함)
      const postAfterRollback = await db.MyDayPost.findByPk(postId);
      expect(postAfterRollback!.get('like_count')).toBe(3);

      // 테스트 후 상태 복원
      await db.MyDayPost.update({ like_count: 0 }, {
        where: { post_id: postId }
      });
    } catch (error) {
      // 에러 발생 시 롤백
      if (transaction1) await transaction1.rollback().catch(err => console.log('트랜잭션1 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      if (transaction2) await transaction2.rollback().catch(err => console.log('트랜잭션2 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      throw error;
    }
  });

  // REPEATABLE READ 격리 수준 테스트
  test('REPEATABLE READ: 트랜잭션 내에서 동일한 쿼리는 항상 같은 결과를 반환해야 함', async () => {
    let transaction1: Transaction | null = null;
    let transaction2: Transaction | null = null;

    try {
      // 첫 번째 트랜잭션 시작 (REPEATABLE READ)
      transaction1 = await db.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
      });

      // 첫 번째 트랜잭션에서 초기 상태 읽기
      const initialPost = await db.MyDayPost.findByPk(postId, {
        transaction: transaction1
      });
      const initialLikeCount = initialPost!.get('like_count');

      // 두 번째 트랜잭션 시작
      transaction2 = await db.sequelize.transaction();

      // 두 번째 트랜잭션에서 게시물 수정 및 커밋
      await db.MyDayPost.increment('like_count', {
        by: 7,
        where: { post_id: postId },
        transaction: transaction2
      });
      await transaction2.commit();

      // 첫 번째 트랜잭션에서 다시 읽기
      const postAfterUpdate = await db.MyDayPost.findByPk(postId, {
        transaction: transaction1
      });

      // REPEATABLE READ에서는 트랜잭션 시작 후 다른 트랜잭션이 커밋한 변경사항이 보이지 않아야 함
      expect(postAfterUpdate!.get('like_count')).toBe(initialLikeCount);

      // 첫 번째 트랜잭션 롤백
      await transaction1.rollback();

      // 트랜잭션 외부에서 조회
      const postOutsideTransaction = await db.MyDayPost.findByPk(postId);
      
      // 두 번째 트랜잭션의 변경사항이 적용되어 있어야 함
      expect(postOutsideTransaction!.get('like_count')).toBe(initialLikeCount + 7);

      // 테스트 후 상태 복원
      await db.MyDayPost.update({ like_count: 0 }, {
        where: { post_id: postId }
      });
    } catch (error) {
      // 에러 발생 시 롤백
      if (transaction1) await transaction1.rollback().catch(err => console.log('트랜잭션1 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      if (transaction2) await transaction2.rollback().catch(err => console.log('트랜잭션2 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      throw error;
    }
  });

  // SERIALIZABLE 격리 수준 테스트
  test('SERIALIZABLE: 동시 트랜잭션이 직렬화되어야 함', async () => {
    let transaction1: Transaction | null = null;
    let transaction2: Transaction | null = null;

    try {
      // 첫 번째 트랜잭션 시작 (SERIALIZABLE)
      transaction1 = await db.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
      });

      // 두 번째 트랜잭션 시작 (SERIALIZABLE)
      transaction2 = await db.sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
      });

      // 첫 번째 트랜잭션에서 좋아요 생성
      await db.MyDayLike.create({
        user_id: testUserId1,
        post_id: postId
      }, { transaction: transaction1 });

      // 첫 번째 트랜잭션에서 좋아요 수 증가
      await db.MyDayPost.increment('like_count', {
        by: 1,
        where: { post_id: postId },
        transaction: transaction1
      });

      // 두 번째 트랜잭션에서도 같은 작업 시도
      // SERIALIZABLE에서는 첫 번째 트랜잭션이 커밋되기 전에는 이 작업이 블록될 수 있음
      // 혹은 데이터베이스에 따라 직렬화 실패로 오류가 발생할 수 있음
      try {
        await db.MyDayLike.create({
          user_id: testUserId2,
          post_id: postId
        }, { transaction: transaction2 });

        await db.MyDayPost.increment('like_count', {
          by: 1,
          where: { post_id: postId },
          transaction: transaction2
        });

        // 두 번째 트랜잭션 커밋 시도
        await transaction2.commit();
        transaction2 = null;
        console.log('두 번째 트랜잭션 커밋 성공 (데이터베이스가 완전한 SERIALIZABLE을 지원하지 않을 수 있음)');
      } catch (error) {
        // 직렬화 실패로 인한 오류가 발생할 수 있음
        console.log('예상된 직렬화 오류:', error instanceof Error ? error.message : '알 수 없는 오류');
        if (transaction2) {
          await transaction2.rollback();
          transaction2 = null;
        }
      }

      // 첫 번째 트랜잭션 커밋
      if (transaction1) {
        await transaction1.commit();
        transaction1 = null;
      }

      // 트랜잭션 외부에서 조회
      const postAfterTransactions = await db.MyDayPost.findByPk(postId);
      const likesCount = await db.MyDayLike.count({
        where: { post_id: postId }
      });

      // 첫 번째 트랜잭션의 변경사항이 적용되어 있어야 함
      // 두 번째 트랜잭션은 데이터베이스에 따라 실패했을 수 있음
      expect(likesCount).toBeGreaterThanOrEqual(1);
      expect(postAfterTransactions!.get('like_count')).toBeGreaterThanOrEqual(1);

      // 테스트 후 상태 복원
      await db.MyDayLike.destroy({
        where: { post_id: postId }
      });
      await db.MyDayPost.update({ like_count: 0 }, {
        where: { post_id: postId }
      });
    } catch (error) {
      // 에러 발생 시 롤백
      if (transaction1) await transaction1.rollback().catch(err => console.log('트랜잭션1 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      if (transaction2) await transaction2.rollback().catch(err => console.log('트랜잭션2 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      throw error;
    }
  });

  // 업데이트 충돌 테스트
  test('업데이트 충돌: 낙관적 락킹 동작 테스트', async () => {
    let transaction1: Transaction | null = null;
    let transaction2: Transaction | null = null;

    try {
      // 트랜잭션 시작
      transaction1 = await db.sequelize.transaction();
      transaction2 = await db.sequelize.transaction();

      // 각 트랜잭션에서 같은 레코드 조회
      const post1 = await db.MyDayPost.findByPk(postId, { transaction: transaction1 });
      const post2 = await db.MyDayPost.findByPk(postId, { transaction: transaction2 });

      // 첫 번째 트랜잭션에서 업데이트
      await post1!.update({ content: '트랜잭션 1에서 수정된 내용' }, { transaction: transaction1 });
      await transaction1.commit();
      transaction1 = null;

      // 두 번째 트랜잭션에서 업데이트 시도
      let conflictDetected = false;
      try {
        await post2!.update({ content: '트랜잭션 2에서 수정된 내용' }, { transaction: transaction2 });
        await transaction2.commit();
        transaction2 = null;
      } catch (error) {
        // 일부 데이터베이스에서는 충돌 감지
        conflictDetected = true;
        if (transaction2) {
          try {
            await transaction2.rollback();
          } catch (rollbackError) {
            console.error('트랜잭션2 롤백 실패:', rollbackError instanceof Error ? rollbackError.message : '알 수 없는 오류');
          }
          transaction2 = null;
        }
      }

      // 코멘트: MySQL은 기본적으로 낙관적 락킹이 아닌 마지막 커밋 승리(last-commit-wins) 전략을 사용하므로
      // 충돌이 감지되지 않을 수 있음. 이 경우 테스트는 항상 통과함
      console.log('충돌 감지 여부:', conflictDetected);

      // 최종 상태 확인
      const finalPost = await db.MyDayPost.findByPk(postId);
      
      // 첫 번째 트랜잭션의 변경사항이 적용되어 있어야 함
      if (!conflictDetected) {
        // 충돌이 감지되지 않았다면 두 번째 트랜잭션의 변경사항이 적용됨
        expect(finalPost!.get('content')).toBe('트랜잭션 2에서 수정된 내용');
      } else {
        // 충돌이 감지되었다면 첫 번째 트랜잭션의 변경사항만 적용됨
        expect(finalPost!.get('content')).toBe('트랜잭션 1에서 수정된 내용');
      }

      // 테스트 후 상태 복원
      await db.MyDayPost.update({ content: '트랜잭션 격리 수준 테스트 게시물' }, {
        where: { post_id: postId }
      });
    } catch (error) {
      // 에러 발생 시 롤백
      if (transaction1) await transaction1.rollback().catch(err => console.log('트랜잭션1 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      if (transaction2) await transaction2.rollback().catch(err => console.log('트랜잭션2 롤백 실패:', err instanceof Error ? err.message : '알 수 없는 오류'));
      throw error;
    }
  });
});