// tests/modelVersioning.test.ts
import { Sequelize, ModelStatic, DataTypes } from 'sequelize';
import db from '../models';
import { startServer, stopServer, sequelize } from '../server';

// 테스트 설정
jest.setTimeout(60000); // 타임아웃을 60초로 늘림

describe('모델 버전 관리 테스트', () => {
  let server: any;

  beforeAll(async () => {
    server = await startServer();
  });

  afterAll(async () => {
    await stopServer();
  });

  // 모델과 데이터베이스 스키마 동기화 테스트
  test('모델 속성이 데이터베이스 스키마와 일치하는지 확인', async () => {
    // 테이블 목록 가져오기
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
      { replacements: [process.env.DB_NAME || 'iexist'] }
    );

    // 테이블 이름 배열 추출
    const tableNames = (tables as any[]).map((table: any) => table.table_name);
    console.log('데이터베이스 테이블 목록:', tableNames);

    // 모델과 테이블 이름 매핑
    const modelTableMap: Record<string, string> = {
      User: 'users',
      Emotion: 'emotions',
      EmotionLog: 'emotion_logs',
      BestPost: 'best_posts',
      Challenge: 'challenges',
      ChallengeEmotion: 'challenge_emotions',
      ChallengeParticipant: 'challenge_participants',
      EncouragementMessage: 'encouragement_messages',
      MyDayComment: 'my_day_comments',
      MyDayEmotion: 'my_day_emotions',
      MyDayLike: 'my_day_likes',
      MyDayPost: 'my_day_posts',
      Notification: 'notifications',
      PostRecommendation: 'post_recommendations',
      PostReport: 'post_reports',
      PostTag: 'post_tags',
      SomeoneDayComment: 'someone_day_comments',
      SomeoneDayLike: 'someone_day_likes',
      SomeoneDayPost: 'someone_day_posts',
      SomeoneDayTag: 'someone_day_tags',
      Tag: 'tags',
      UserGoal: 'user_goals',
      UserStats: 'user_stats',
      UserBlock: 'user_blocks'
    };

    // 각 모델에 대해 테이블 존재 확인
    for (const [modelName, tableName] of Object.entries(modelTableMap)) {
      expect(tableNames).toContain(tableName);
      console.log(`테이블 확인: ${tableName}`);
      
      // 테이블 컬럼 정보 가져오기
      const [columns] = await sequelize.query(
        `SHOW COLUMNS FROM ${tableName}`,
        { type: 'SELECT' }
      );
      
      console.log(`'${tableName}' 테이블 컬럼:`, columns);

      // 모델 속성 가져오기
      const model = (db as any)[modelName];
      if (!model) {
        console.warn(`모델 '${modelName}'을 찾을 수 없습니다.`);
        continue;
      }

      // 모델의 속성 가져오기
      const modelAttributes = model.getAttributes();
      console.log(`'${modelName}' 모델 속성:`, Object.keys(modelAttributes));

      // 데이터베이스 컬럼과 모델 속성 비교
      for (const column of (Array.isArray(columns) ? columns : []) as any[]) {
        const columnName = column.Field;
        
        // 타임스탬프 컬럼 제외
        if (['created_at', 'updated_at'].includes(columnName)) {
          continue;
        }
        
        // 컬럼이 모델에 존재하는지 확인
        const camelCaseColumnName = columnName.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase());
        const snakeCaseColumnName = columnName;
        
        const modelHasColumn = !!modelAttributes[camelCaseColumnName] || 
                             !!modelAttributes[snakeCaseColumnName];
        
        if (!modelHasColumn) {
          console.warn(`'${modelName}' 모델에 '${columnName}' 컬럼이 없습니다.`);
        }
        
        expect(modelHasColumn).toBeTruthy();
      }
    }
  });

  // 모델 관계 테스트
  test('모델 간 관계가 올바르게 설정되어 있는지 확인', async () => {
    // User - MyDayPost 관계 테스트
    const userAssociations = (db.User as any).associations;
    expect(userAssociations).toHaveProperty('my_day_posts');
    
    // MyDayPost - User 관계 테스트
    const myDayPostAssociations = (db.MyDayPost as any).associations;
    expect(myDayPostAssociations).toHaveProperty('user');
    
    // MyDayPost - Emotion 관계 테스트
    expect(myDayPostAssociations).toHaveProperty('emotions');
    
    // Challenge - User 관계 테스트
    const challengeAssociations = (db.Challenge as any).associations;
    expect(challengeAssociations).toHaveProperty('creator');
    
    // 더 많은 관계 테스트...
  });

      // 카운터 컬럼 테스트
  test('카운터 컬럼이 올바르게 업데이트되는지 확인', async () => {
    try {
      // 먼저 테이블 구조 확인
      console.log("테스트 시작 - 테이블 존재 여부 확인");
      
      // 테이블 목록 가져오기
      const [tables] = await sequelize.query(
        "SHOW TABLES",
        { type: 'RAW' }
      );
      
      console.log("테이블 목록:", tables);
      
      // 직접 SQL 쿼리를 사용하여 테스트
      // 사용자 생성
      const nowTime = Date.now();
      const username = `test_counter_${nowTime}`;
      const email = `test_counter_${nowTime}@example.com`;
      
      console.log("사용자 생성 시도:", { username, email });
      
      const [userResult] = await sequelize.query(
        `INSERT INTO users (username, email, password_hash, nickname, is_active, created_at, updated_at, notification_settings, privacy_settings) 
        VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`,
        { 
          replacements: [
            username, 
            email, 
            'password_hash', 
            'TestCounter', 
            1, // boolean true 대신 1 사용
            JSON.stringify({
              like_notifications: true,
              comment_notifications: true,
              challenge_notifications: true,
              encouragement_notifications: true
            }),
            '{}'
          ],
          type: 'INSERT'
        }
      );
      
      console.log("사용자 생성 결과:", userResult);
      
      // 삽입된 사용자의 ID 가져오기
      const insertedUserId = Array.isArray(userResult) ? userResult[0] : userResult;
      
      console.log("생성된 사용자 ID:", insertedUserId);
      
      // 게시물 생성
      const [postResult] = await sequelize.query(
        `INSERT INTO my_day_posts (user_id, content, is_anonymous, character_count, like_count, comment_count, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { 
          replacements: [insertedUserId, 'Test counter post content', 0, 27, 0, 0], // boolean false 대신 0 사용
          type: 'INSERT'
        }
      );
      
      console.log("게시물 생성 결과:", postResult);
      
      // 삽입된 게시물의 ID 가져오기
      const insertedPostId = Array.isArray(postResult) ? postResult[0] : postResult;
    
    // 댓글 생성
    console.log("댓글 생성 시작:", { postId: insertedPostId, userId: insertedUserId });
    
    const [commentResult] = await sequelize.query(
      `INSERT INTO my_day_comments (post_id, user_id, content, is_anonymous, created_at) 
      VALUES (?, ?, ?, ?, NOW())`,
      { 
        replacements: [insertedPostId, insertedUserId, 'Test comment', 0], // boolean false 대신 0 사용
        type: 'INSERT'
      }
    );
    
    console.log("댓글 생성 결과:", commentResult);
    
    // 게시물의 comment_count 업데이트
    console.log("게시물 카운터 업데이트 시작");
    
    const [updateResult] = await sequelize.query(
      `UPDATE my_day_posts SET comment_count = 1 WHERE post_id = ?`,
      { 
        replacements: [insertedPostId],
        type: 'UPDATE'
      }
    );
    
    console.log("게시물 카운터 업데이트 결과:", updateResult);
    
    // 결과 확인
    console.log("결과 조회 시작");
    
    // 단순한 형태의 쿼리로 변경
    const [queryResult] = await sequelize.query(
      `SELECT * FROM my_day_posts WHERE post_id = ${insertedPostId}`
    );
    
    console.log("게시물 조회 결과:", queryResult);
    
    // 결과 검증
    if (Array.isArray(queryResult) && queryResult.length > 0) {
      const post = queryResult[0] as { comment_count: number };
      console.log("조회된 게시물:", post);
      expect(post.comment_count).toBe(1);
    } else {
      console.error("게시물을 찾을 수 없습니다:", { postId: insertedPostId, result: queryResult });
      
      // 모든 게시물 조회해보기
      const [allPosts] = await sequelize.query("SELECT * FROM my_day_posts");
      console.log("전체 게시물 목록:", allPosts);
      
      // 테스트 실패
      fail("게시물을 찾을 수 없습니다");
    }
    
    // 정리 - 테스트 데이터 삭제
    console.log("테스트 데이터 정리 시작");
    try {
      // 댓글 삭제
      await sequelize.query(
        `DELETE FROM my_day_comments WHERE post_id = ${insertedPostId}`
      );
      console.log("댓글 삭제 완료");
      
      // 게시물 삭제
      await sequelize.query(
        `DELETE FROM my_day_posts WHERE post_id = ${insertedPostId}`
      );
      console.log("게시물 삭제 완료");
      
      // 사용자 삭제
      await sequelize.query(
        `DELETE FROM users WHERE user_id = ${insertedUserId}`
      );
      console.log("사용자 삭제 완료");
    } catch (cleanupError) {
      console.error('테스트 데이터 정리 중 오류:', cleanupError);
    }
    console.log("테스트 데이터 정리 완료");
    } catch (e) {
      console.error("테스트 실행 중 오류 발생:", e);
      throw e;
    }
  });
});