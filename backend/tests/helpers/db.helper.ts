// backend/tests/helpers/db.helper.ts
import db from '../../models';

export const clearDatabase = async () => {
  try {
    // 외래 키 제약 조건 일시 비활성화
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 테이블 삭제 순서 (자식 -> 부모 순서로)
    const tables = [
      // 연관 테이블 먼저 삭제
      'emotion_logs',
      'my_day_emotions',
      'my_day_likes',
      'my_day_comments',
      'someone_day_comments',
      'someone_day_likes',
      'someone_day_tags',
      'post_tags',
      'post_reports',
      'post_recommendations',
      'best_posts',
      'challenge_emotions',
      'challenge_participants',
      'encouragement_messages',
      'notifications',
      
      // 메인 테이블 삭제
      'my_day_posts',
      'someone_day_posts',
      'challenges',
      'user_blocks',
      'user_goals',
      'user_stats',
      'users',
      'tags',
      'emotions'
    ];

    // 각 테이블 삭제 - 오류 무시하고 모든 테이블 삭제 시도
    for (const table of tables) {
      try {
        await db.sequelize.query(`DELETE FROM ${table}`);
      } catch (tableError) {
        console.warn(`테이블 삭제 중 오류 (${table}):`, tableError);
        // 개별 테이블 삭제 오류는 무시하고 계속 진행
      }
    }

    // 외래 키 제약 조건 다시 활성화
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류:', error);
    // 오류가 발생해도 외래키 체크는 다시 활성화
    try {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      console.error('외래키 체크 활성화 중 오류:', e);
    }
  }
};
export const createTestUser = async (userData: any) => {
  try {
    return await db.User.create(userData);
  } catch (error) {
    console.error('테스트 사용자 생성 중 오류:', error);
    throw error;
  }
};

export const createTestEmotion = async (emotionData: any) => {
  try {
    return await db.Emotion.create(emotionData);
  } catch (error) {
    console.error('테스트 감정 생성 중 오류:', error);
    throw error;
  }
};

export const createTestEmotionLog = async (logData: any) => {
  try {
    return await db.EmotionLog.create(logData);
  } catch (error) {
    console.error('테스트 감정 로그 생성 중 오류:', error);
    throw error;
  }
};