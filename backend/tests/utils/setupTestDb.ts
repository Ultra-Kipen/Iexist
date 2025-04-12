// setupTestDb.ts 수정된 버전
import dotenv from 'dotenv';
import path from 'path';
import db from '../../models';
import { Sequelize, QueryTypes } from 'sequelize';

// 테스트용 환경변수 설정
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// 테스트 DB 설정 초기화
const setupTestDb = async () => {
  try {
    // DB 연결
    await db.sequelize.authenticate();
    console.log('테스트 데이터베이스 연결 성공');
    
    // 수동으로 테이블을 삭제하고 생성
    // 순서가 중요함 - 외래 키 제약 조건을 고려하여 삭제 후 생성 순서 설정
    
    // 1. 먼저 외래 키 제약 조건이 있는 테이블 삭제
    const dropTableQueries = [
      'DROP TABLE IF EXISTS `user_stats`;',
      'DROP TABLE IF EXISTS `user_blocks`;',
      'DROP TABLE IF EXISTS `user_goals`;',
      'DROP TABLE IF EXISTS `user_goal`;',
      'DROP TABLE IF EXISTS `encouragement_messages`;',
      'DROP TABLE IF EXISTS `someone_day_tags`;',
      'DROP TABLE IF EXISTS `someone_day_likes`;',
      'DROP TABLE IF EXISTS `someone_day_comments`;',
      'DROP TABLE IF EXISTS `post_tags`;',
      'DROP TABLE IF EXISTS `post_reports`;',
      'DROP TABLE IF EXISTS `post_recommendations`;',
      'DROP TABLE IF EXISTS `notifications`;',
      'DROP TABLE IF EXISTS `my_day_likes`;',
      'DROP TABLE IF EXISTS `my_day_emotions`;',
      'DROP TABLE IF EXISTS `my_day_comments`;',
      'DROP TABLE IF EXISTS `emotion_logs`;',
      'DROP TABLE IF EXISTS `challenge_participants`;',
      'DROP TABLE IF EXISTS `challenge_emotions`;',
      'DROP TABLE IF EXISTS `best_posts`;',
      
      // 2. 그 다음 기본 테이블 삭제
      'DROP TABLE IF EXISTS `someone_day_posts`;',
      'DROP TABLE IF EXISTS `my_day_posts`;',
      'DROP TABLE IF EXISTS `challenges`;',
      'DROP TABLE IF EXISTS `tags`;',
      'DROP TABLE IF EXISTS `emotions`;',
      'DROP TABLE IF EXISTS `users`;'
    ];
    
    for (const query of dropTableQueries) {
      await db.sequelize.query(query, { type: QueryTypes.RAW });
    }
    
    console.log('기존 테이블 삭제 완료');
    
    // 3. 실제 DB와 일치하는 테이블 생성 쿼리
    const createTableQueries = [
      // users 테이블 생성
      `CREATE TABLE IF NOT EXISTS \`users\` (
        \`user_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`username\` varchar(50) NOT NULL,
        \`email\` varchar(100) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`nickname\` varchar(50) DEFAULT NULL,
        \`profile_image_url\` varchar(255) DEFAULT NULL,
        \`background_image_url\` varchar(255) DEFAULT NULL,
        \`favorite_quote\` varchar(255) DEFAULT NULL,
        \`theme_preference\` enum('light','dark','system') DEFAULT 'system',
        \`privacy_settings\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`privacy_settings\`)),
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        \`last_login_at\` datetime DEFAULT NULL,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        \`notification_settings\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`notification_settings\`)),
        \`reset_token\` varchar(255) DEFAULT NULL,
        \`reset_token_expires\` datetime DEFAULT NULL,
        PRIMARY KEY (\`user_id\`),
        UNIQUE KEY \`username\` (\`username\`),
        UNIQUE KEY \`email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      
      // emotions 테이블 생성
      `CREATE TABLE IF NOT EXISTS \`emotions\` (
        \`emotion_id\` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT,
        \`name\` varchar(50) NOT NULL,
        \`icon\` varchar(50) NOT NULL,
        \`color\` varchar(50) NOT NULL,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        PRIMARY KEY (\`emotion_id\`),
        UNIQUE KEY \`name\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,
      
      // my_day_posts 테이블 생성
      `CREATE TABLE IF NOT EXISTS \`my_day_posts\` (
        \`post_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`content\` text NOT NULL,
        \`emotion_summary\` varchar(100) DEFAULT NULL,
        \`image_url\` varchar(255) DEFAULT NULL,
        \`is_anonymous\` tinyint(1) NOT NULL DEFAULT 0,
        \`character_count\` smallint(5) UNSIGNED DEFAULT NULL,
        \`like_count\` int(11) NOT NULL DEFAULT 0,
        \`comment_count\` int(11) NOT NULL DEFAULT 0,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        PRIMARY KEY (\`post_id\`),
        KEY \`user_id\` (\`user_id\`),
        CONSTRAINT \`my_day_posts_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,
      
      // challenges 테이블 생성
      `CREATE TABLE IF NOT EXISTS \`challenges\` (
        \`challenge_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`creator_id\` int(11) NOT NULL,
        \`title\` varchar(100) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`start_date\` date NOT NULL,
        \`end_date\` date NOT NULL,
        \`is_public\` tinyint(1) NOT NULL DEFAULT 1,
        \`max_participants\` int(11) DEFAULT NULL,
        \`participant_count\` int(11) NOT NULL DEFAULT 0,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        PRIMARY KEY (\`challenge_id\`),
        KEY \`creator_id\` (\`creator_id\`),
        CONSTRAINT \`challenges_ibfk_1\` FOREIGN KEY (\`creator_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,
      
      // challenge_emotions 테이블 생성 (실제 DB 구조에 맞게)
      `CREATE TABLE IF NOT EXISTS \`challenge_emotions\` (
        \`challenge_emotion_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`challenge_id\` int(11) NOT NULL,
        \`user_id\` int(11) NOT NULL,
        \`emotion_id\` tinyint(3) UNSIGNED NOT NULL,
        \`log_date\` date NOT NULL,
        \`note\` varchar(200) DEFAULT NULL,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        PRIMARY KEY (\`challenge_emotion_id\`),
        KEY \`challenge_id\` (\`challenge_id\`),
        KEY \`user_id\` (\`user_id\`),
        KEY \`emotion_id\` (\`emotion_id\`),
        CONSTRAINT \`challenge_emotions_ibfk_1\` FOREIGN KEY (\`challenge_id\`) REFERENCES \`challenges\` (\`challenge_id\`),
        CONSTRAINT \`challenge_emotions_ibfk_2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`),
        CONSTRAINT \`challenge_emotions_ibfk_3\` FOREIGN KEY (\`emotion_id\`) REFERENCES \`emotions\` (\`emotion_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      
      // 기타 테이블들도 비슷한 방식으로 생성...
      // 여기서는 주요 테이블만 포함하였습니다
    ];
    
    for (const query of createTableQueries) {
      await db.sequelize.query(query, { type: QueryTypes.RAW });
    }
    
    console.log('테이블 생성 완료');
    
    // 4. 기본 데이터 삽입 (예: 기본 감정 데이터)
    const insertDataQueries = [
      `INSERT INTO \`emotions\` (\`emotion_id\`, \`name\`, \`icon\`, \`color\`, \`created_at\`, \`updated_at\`) VALUES
        (1, '행복', 'emoticon-happy-outline', '#FFD700', NOW(), NOW()),
        (2, '감사', 'hand-heart', '#FF69B4', NOW(), NOW()),
        (3, '위로', 'hand-peace', '#87CEEB', NOW(), NOW()),
        (4, '감동', 'heart-outline', '#FF6347', NOW(), NOW()),
        (5, '슬픔', 'emoticon-sad-outline', '#4682B4', NOW(), NOW()),
        (6, '불안', 'alert-outline', '#DDA0DD', NOW(), NOW()),
        (7, '화남', 'emoticon-angry-outline', '#FF4500', NOW(), NOW()),
        (8, '지침', 'emoticon-neutral-outline', '#A9A9A9', NOW(), NOW()),
        (9, '우울', 'weather-cloudy', '#708090', NOW(), NOW()),
        (10, '고독', 'account-outline', '#8B4513', NOW(), NOW()),
        (11, '충격', 'lightning-bolt', '#9932CC', NOW(), NOW()),
        (12, '편함', 'sofa-outline', '#32CD32', NOW(), NOW());`
    ];
    
    for (const query of insertDataQueries) {
      await db.sequelize.query(query, { type: QueryTypes.RAW });
    }
    
    console.log('기본 데이터 삽입 완료');
    
    return { success: true };
  } catch (error) {
    console.error('테스트 데이터베이스 설정 실패:', error);
    return { success: false, error };
  }
};

// 테스트 데이터베이스 정리
const teardownTestDb = async () => {
  try {
    await db.sequelize.close();
    console.log('테스트 데이터베이스 연결 종료');
    return { success: true };
  } catch (error) {
    console.error('테스트 데이터베이스 정리 실패:', error);
    return { success: false, error };
  }
};

export { setupTestDb, teardownTestDb };
export default setupTestDb;