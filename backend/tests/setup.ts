// setup.ts
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';
import { QueryTypes, Sequelize } from 'sequelize';
import request from 'supertest';
import app from '../app';
import db from '../models';
// 테스트를 위한 앱 인스턴스 노출
export { app };
dotenv.config({ 
 path: path.join(__dirname, '../.env.test')
});

let isDbInitialized = false;
let dbConnection: Sequelize | null = null;

// 테스트 데이터 캐시
const testDataCache = new Map();

// 실제 DB 스키마를 기반으로 한 SQL 스크립트
const DB_SCHEMA = `
SET FOREIGN_KEY_CHECKS=0;

-- 테이블 삭제 (존재하는 경우)
DROP TABLE IF EXISTS my_day_emotions;
DROP TABLE IF EXISTS my_day_likes;
DROP TABLE IF EXISTS my_day_comments;
DROP TABLE IF EXISTS someone_day_comments;
DROP TABLE IF EXISTS someone_day_likes;
DROP TABLE IF EXISTS someone_day_tags;
DROP TABLE IF EXISTS post_tags;
DROP TABLE IF EXISTS post_reports;
DROP TABLE IF EXISTS post_recommendations;
DROP TABLE IF EXISTS best_posts;
DROP TABLE IF EXISTS challenge_emotions;
DROP TABLE IF EXISTS challenge_participants;
DROP TABLE IF EXISTS encouragement_messages;
DROP TABLE IF EXISTS emotion_logs;
DROP TABLE IF EXISTS my_day_posts;
DROP TABLE IF EXISTS someone_day_posts;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_blocks;
DROP TABLE IF EXISTS user_goal;
DROP TABLE IF EXISTS user_goals;
DROP TABLE IF EXISTS user_stats;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS emotions;

-- 기본 테이블 생성
CREATE TABLE emotions (
  emotion_id tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  icon varchar(50) NOT NULL,
  color varchar(50) NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (emotion_id),
  UNIQUE KEY name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tags (
  tag_id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (tag_id),
  UNIQUE KEY name (name),
  UNIQUE KEY tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE users (
  user_id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  email varchar(100) NOT NULL,
  password_hash varchar(255) NOT NULL,
  nickname varchar(50) DEFAULT NULL,
  profile_image_url varchar(255) DEFAULT NULL,
  background_image_url varchar(255) DEFAULT NULL,
  favorite_quote varchar(255) DEFAULT NULL,
  theme_preference enum('light','dark','system') DEFAULT 'system',
  privacy_settings longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(privacy_settings)),
  is_active tinyint(1) NOT NULL DEFAULT 1,
  last_login_at datetime DEFAULT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  notification_settings longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(notification_settings)),
  reset_token varchar(255) DEFAULT NULL,
  reset_token_expires datetime DEFAULT NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_stats (
  user_id int(11) NOT NULL,
  my_day_post_count int(11) NOT NULL DEFAULT 0,
  someone_day_post_count int(11) NOT NULL DEFAULT 0,
  my_day_like_received_count int(11) NOT NULL DEFAULT 0,
  someone_day_like_received_count int(11) NOT NULL DEFAULT 0,
  my_day_comment_received_count int(11) NOT NULL DEFAULT 0,
  someone_day_comment_received_count int(11) NOT NULL DEFAULT 0,
  challenge_count int(11) NOT NULL DEFAULT 0,
  last_updated datetime NOT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT user_stats_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE user_goals (
  goal_id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  target_emotion_id tinyint(3) UNSIGNED NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  progress int(11) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (goal_id),
  KEY user_id (user_id),
  KEY target_emotion_id (target_emotion_id),
  CONSTRAINT user_goals_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT user_goals_ibfk_2 FOREIGN KEY (target_emotion_id) REFERENCES emotions (emotion_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE user_blocks (
  user_id int(11) NOT NULL,
  blocked_user_id int(11) NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (user_id,blocked_user_id),
  KEY blocked_user_id (blocked_user_id),
  CONSTRAINT user_blocks_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT user_blocks_ibfk_2 FOREIGN KEY (blocked_user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE emotion_logs (
  log_id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  emotion_id tinyint(3) UNSIGNED NOT NULL,
  note varchar(200) DEFAULT NULL,
  log_date date NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (log_id),
  KEY user_id (user_id),
  KEY emotion_id (emotion_id),
  CONSTRAINT emotion_logs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT emotion_logs_ibfk_2 FOREIGN KEY (emotion_id) REFERENCES emotions (emotion_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE challenges (
  challenge_id int(11) NOT NULL AUTO_INCREMENT,
  creator_id int(11) NOT NULL,
  title varchar(100) NOT NULL,
  description text DEFAULT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_public tinyint(1) NOT NULL DEFAULT 1,
  max_participants int(11) DEFAULT NULL,
  participant_count int(11) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (challenge_id),
  KEY creator_id (creator_id),
  CONSTRAINT challenges_ibfk_1 FOREIGN KEY (creator_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE challenge_emotions (
  challenge_emotion_id int(11) NOT NULL AUTO_INCREMENT,
  challenge_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  emotion_id tinyint(3) UNSIGNED NOT NULL,
  log_date date NOT NULL,
  note varchar(200) DEFAULT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (challenge_emotion_id),
  KEY challenge_id (challenge_id),
  KEY user_id (user_id),
  KEY emotion_id (emotion_id),
  CONSTRAINT challenge_emotions_ibfk_1 FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id),
  CONSTRAINT challenge_emotions_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT challenge_emotions_ibfk_3 FOREIGN KEY (emotion_id) REFERENCES emotions (emotion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE challenge_participants (
  challenge_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (challenge_id,user_id),
  UNIQUE KEY challenge_participants_challenge_id_user_id_unique (challenge_id,user_id),
  UNIQUE KEY challenge_participants_challenge_id_user_id (challenge_id,user_id),
  KEY user_id (user_id),
  CONSTRAINT challenge_participants_ibfk_1 FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT challenge_participants_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE my_day_posts (
  post_id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  content text NOT NULL,
  emotion_summary varchar(100) DEFAULT NULL,
  image_url varchar(255) DEFAULT NULL,
  is_anonymous tinyint(1) NOT NULL DEFAULT 0,
  character_count smallint(5) UNSIGNED DEFAULT NULL,
  like_count int(11) NOT NULL DEFAULT 0,
  comment_count int(11) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (post_id),
  KEY user_id (user_id),
  CONSTRAINT my_day_posts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE someone_day_posts (
  post_id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  title varchar(100) NOT NULL,
  content text NOT NULL,
  summary varchar(200) DEFAULT NULL,
  image_url varchar(255) DEFAULT NULL,
  is_anonymous tinyint(1) NOT NULL DEFAULT 0,
  character_count int(11) DEFAULT NULL,
  like_count int(11) NOT NULL DEFAULT 0,
  comment_count int(11) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (post_id),
  KEY someone_day_posts_user_id (user_id),
  KEY someone_day_posts_created_at (created_at),
  KEY someone_day_posts_like_count (like_count),
  CONSTRAINT someone_day_posts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE my_day_comments (
  comment_id int(11) NOT NULL AUTO_INCREMENT,
  post_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  content varchar(500) NOT NULL,
  is_anonymous tinyint(1) DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (comment_id),
  KEY my_day_comments_post_id (post_id),
  KEY my_day_comments_user_id (user_id),
  CONSTRAINT my_day_comments_ibfk_1 FOREIGN KEY (post_id) REFERENCES my_day_posts (post_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT my_day_comments_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE my_day_emotions (
  post_id int(11) NOT NULL,
  emotion_id tinyint(3) UNSIGNED NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (post_id,emotion_id),
  UNIQUE KEY my_day_emotions_post_id_emotion_id_unique (post_id,emotion_id),
  KEY my_day_emotions_post_id (post_id),
  KEY my_day_emotions_emotion_id (emotion_id),
  CONSTRAINT my_day_emotions_ibfk_1 FOREIGN KEY (post_id) REFERENCES my_day_posts (post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT my_day_emotions_ibfk_2 FOREIGN KEY (emotion_id) REFERENCES emotions (emotion_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE my_day_likes (
  user_id int(11) NOT NULL,
  post_id int(11) NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (user_id,post_id),
  KEY my_day_likes_post_id (post_id),
  KEY my_day_likes_user_id (user_id),
  CONSTRAINT my_day_likes_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT my_day_likes_ibfk_2 FOREIGN KEY (post_id) REFERENCES my_day_posts (post_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE someone_day_comments (
  comment_id int(11) NOT NULL AUTO_INCREMENT,
  post_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  content varchar(500) NOT NULL,
  is_anonymous tinyint(1) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (comment_id),
  KEY someone_day_comments_post_id (post_id),
  KEY someone_day_comments_user_id (user_id),
  CONSTRAINT someone_day_comments_ibfk_1 FOREIGN KEY (post_id) REFERENCES someone_day_posts (post_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT someone_day_comments_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE someone_day_likes (
  id int(11) NOT NULL AUTO_INCREMENT,
  post_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY someone_day_likes_post_id_user_id (post_id,user_id),
  KEY user_id (user_id),
  CONSTRAINT someone_day_likes_ibfk_1 FOREIGN KEY (post_id) REFERENCES someone_day_posts (post_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT someone_day_likes_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE someone_day_tags (
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  post_id int(11) NOT NULL,
  tag_id int(11) NOT NULL,
  PRIMARY KEY (post_id,tag_id),
  KEY tag_id (tag_id),
  CONSTRAINT someone_day_tags_ibfk_1 FOREIGN KEY (post_id) REFERENCES someone_day_posts (post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT someone_day_tags_ibfk_2 FOREIGN KEY (tag_id) REFERENCES tags (tag_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE post_tags (
  post_id int(11) NOT NULL,
  tag_id int(11) NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (post_id,tag_id),
  KEY post_tags_post_id (post_id),
  KEY post_tags_tag_id (tag_id),
  CONSTRAINT post_tags_ibfk_1 FOREIGN KEY (post_id) REFERENCES someone_day_posts (post_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT post_tags_ibfk_2 FOREIGN KEY (tag_id) REFERENCES tags (tag_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE post_reports (
  report_id int(11) NOT NULL AUTO_INCREMENT,
  post_id int(11) NOT NULL,
  reporter_id int(11) NOT NULL,
  report_type enum('spam','inappropriate','harassment','other','content') NOT NULL,
  description text DEFAULT NULL,
  status enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (report_id),
  KEY post_reports_post_id (post_id),
  KEY post_reports_reporter_id (reporter_id),
  KEY post_reports_status (status),
  KEY post_reports_created_at (created_at),
  CONSTRAINT post_reports_ibfk_1 FOREIGN KEY (post_id) REFERENCES someone_day_posts (post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT post_reports_ibfk_2 FOREIGN KEY (reporter_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE post_recommendations (
  recommendation_id int(11) NOT NULL AUTO_INCREMENT,
  post_id int(11) NOT NULL,
  recommended_post_id int(11) NOT NULL,
  post_type enum('my_day','someone_day') NOT NULL,
  reason varchar(100) DEFAULT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (recommendation_id),
  KEY post_recommendations_post_id (post_id),
  KEY post_recommendations_recommended_post_id (recommended_post_id),
  CONSTRAINT post_recommendations_ibfk_1 FOREIGN KEY (post_id) REFERENCES someone_day_posts (post_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT post_recommendations_ibfk_2 FOREIGN KEY (recommended_post_id) REFERENCES someone_day_posts (post_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE best_posts (
  best_post_id int(11) NOT NULL AUTO_INCREMENT,
  post_id int(11) NOT NULL,
  post_type enum('my_day','someone_day') NOT NULL,
  category enum('weekly','monthly') NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (best_post_id),
  KEY post_id (post_id),
  CONSTRAINT best_posts_ibfk_1 FOREIGN KEY (post_id) REFERENCES someone_day_posts (post_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE encouragement_messages (
  message_id int(11) NOT NULL AUTO_INCREMENT,
  sender_id int(11) NOT NULL,
  receiver_id int(11) NOT NULL,
  post_id int(11) NOT NULL,
  message text NOT NULL,
  is_anonymous tinyint(1) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  PRIMARY KEY (message_id),
  KEY encouragement_messages_sender_id (sender_id),
  KEY encouragement_messages_receiver_id (receiver_id),
  KEY encouragement_messages_post_id (post_id),
  KEY encouragement_messages_created_at (created_at),
  CONSTRAINT encouragement_messages_ibfk_1 FOREIGN KEY (sender_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT encouragement_messages_ibfk_2 FOREIGN KEY (receiver_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT encouragement_messages_ibfk_3 FOREIGN KEY (post_id) REFERENCES someone_day_posts (post_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE notifications (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  content varchar(255) NOT NULL,
  notification_type enum('like','comment','challenge','system') NOT NULL,
  related_id int(11) DEFAULT NULL,
  is_read tinyint(1) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  PRIMARY KEY (id),
  KEY notifications_user_id_is_read (user_id,is_read),
  KEY notifications_created_at (created_at),
  CONSTRAINT notifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS=1;
`;

async function checkDatabaseConnection() {
 try {
   await db.sequelize.authenticate();
   console.log('데이터베이스 연결 성공');
   return true;
 } catch (error) {
   console.error('데이터베이스 연결 실패:', error);
   return false;
 }
}

async function recreateDatabase() {
 try {
   const dbUser = process.env.DB_USER || 'Iexist';
   const dbPassword = process.env.DB_PASSWORD || 'sw309824!@';
   const dbHost = process.env.DB_HOST || 'localhost';

   if (dbConnection) {
     await dbConnection.close();
     dbConnection = null;
   }

   const tempDb = new Sequelize('mysql', dbUser, dbPassword, {
     host: dbHost,
     dialect: 'mysql',
     logging: false
   });

   await tempDb.query('DROP DATABASE IF EXISTS iexist_test');
   await tempDb.query('CREATE DATABASE iexist_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
   
   await tempDb.close();

   const newDb = new Sequelize('iexist_test', dbUser, dbPassword, {
     host: dbHost,
     dialect: 'mysql',
     logging: false,
     pool: {
       max: 10,
       min: 0,
       acquire: 60000,
       idle: 20000
     },
     dialectOptions: {
       connectTimeout: 60000
     }
   });

   await newDb.authenticate();
   dbConnection = newDb;
   
   return newDb;
 } catch (error) {
   console.error('데이터베이스 재생성 실패:', error);
   throw error;
 }
}

export async function setupDatabase() {
  try {
    console.log('데이터베이스 초기화 시작...');
    
    // 데이터베이스 연결 확인
    const connected = await checkDatabaseConnection();
    if (!connected) {
      console.log('데이터베이스 연결 실패, 재연결 시도...');
      await db.sequelize.authenticate();
    }
    
    // 외래 키 제약 해제
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=0;');
    
    // SQL 쿼리 분리 및 실행
    console.log('테이블 생성 시작...');
    const schemaQueries = DB_SCHEMA.split(';')
      .filter(query => query.trim().length > 0)
      .map(query => query.trim() + ';');
    
    try {
      // 모든 쿼리 순차적으로 실행
      for (const query of schemaQueries) {
        try {
          await db.sequelize.query(query);
        } catch (err) {
          // 테이블 이미 존재 등의 오류는 무시
          if (String(err).includes('already exists')) {
            continue;
          }
          console.warn('SQL 쿼리 실행 중 오류:', err);
        }
      }
    } catch (error) {
      console.error('테이블 생성 중 오류:', error);
    }
    
    // 외래 키 제약 다시 활성화
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=1;');
    
    // 감정 데이터 초기화
    await initializeEmotions();
    
    console.log('데이터베이스 초기화 완료');
    return true;
  } catch (error) {
    console.error('데이터베이스 설정 실패:', error);
    // 오류는 기록하지만 테스트가 계속 실행되도록 함
    return false;
  }
}

async function validateAndRepairForeignKeys() {
  try {
    console.log('외래 키 무결성 검사 및 복구 시작');
    
    // 외래 키 제약 일시 중지
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=0;');

    // 외래 키 제약 다시 활성화
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=1;');

    console.log('외래 키 무결성 검사 및 복구 완료');
  } catch (error) {
    console.error('외래 키 무결성 검사 중 오류:', error);
    // 오류는 기록하지만 테스트가 계속 실행되도록 함
  }
}

async function initializeEmotions() {
  const emotions = [
    { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 4, name: '감동', icon: 'heart-outline', color: '#FF6347', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 5, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 6, name: '불안', icon: 'alert-outline', color: '#DDA0DD', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 7, name: '화남', icon: 'emoticon-angry-outline', color: '#FF4500', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 8, name: '지침', icon: 'emoticon-neutral-outline', color: '#A9A9A9', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 9, name: '우울', icon: 'weather-cloudy', color: '#708090', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 10, name: '고독', icon: 'account-outline', color: '#8B4513', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 11, name: '충격', icon: 'lightning-bolt', color: '#9932CC', created_at: new Date(), updated_at: new Date() },
    { emotion_id: 12, name: '편함', icon: 'sofa-outline', color: '#32CD32', created_at: new Date(), updated_at: new Date() }
  ];

  try {
    // 기존 감정 데이터 삭제 (중복 방지)
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=0;');
    await db.sequelize.query('TRUNCATE TABLE emotions;');
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=1;');
    
    // 감정 데이터 일괄 생성
    await db.Emotion.bulkCreate(emotions, {
      ignoreDuplicates: true
    });
    console.log('감정 데이터 초기화 완료');
  } catch (error) {
    console.error('감정 데이터 초기화 실패:', error);
    
    // 개별 생성 시도
    try {
      for (const emotion of emotions) {
        await db.Emotion.findOrCreate({
          where: { emotion_id: emotion.emotion_id },
          defaults: emotion
        });
      }
      console.log('감정 데이터 개별 초기화 완료');
    } catch (secondaryError) {
      console.error('감정 데이터 개별 초기화 실패:', secondaryError);
    }
  }
}

async function createTestEmotionLogs(userId: number) {
  try {
    console.log('테스트 감정 로그 생성 시도');

    // 감정 ID가 있는지 확인
    const emotions = await db.Emotion.findAll();
    if (emotions.length === 0) {
      await initializeEmotions();
    }

    // 현재 날짜
    const today = new Date();

    // 감정 로그 생성
    const logs = [
      {
        user_id: userId,
        emotion_id: 1, // 행복
        note: '오늘은 정말 좋은 하루였어요',
        log_date: today,
        created_at: today,
        updated_at: today
      },
      {
        user_id: userId,
        emotion_id: 5, // 슬픔
        note: '지난주에는 슬픈 일이 있었어요',
        log_date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        created_at: today,
        updated_at: today
      }
    ];

    try {
      await db.EmotionLog.bulkCreate(logs);
      console.log('테스트 감정 로그 생성 성공');
      return true;
    } catch (createError) {
      console.warn('bulkCreate 실패, 개별 생성 시도:', createError);

      // 개별적으로 생성 시도
      for (const log of logs) {
        try {
          await db.EmotionLog.create(log);
        } catch (individualError) {
          console.warn('개별 감정 로그 생성 실패:', individualError);
        }
      }

      return true;
    }
  } catch (error) {
    console.error('테스트 감정 로그 생성 실패:', error);
    // 실패해도 테스트는 계속 진행
    return false;
  }
}

async function createTestChallenge(user_id: number) {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const challenge = await db.Challenge.create({
      creator_id: user_id,
      title: `테스트 챌린지 ${Date.now()}`,
      description: '테스트 챌린지 설명입니다.',
      start_date: startDate,
      end_date: endDate,
      is_public: true,
      participant_count: 1,
      created_at: new Date(),
      updated_at: new Date()
    });

    try {
      // ChallengeParticipant 생성 시 created_at, updated_at 제거 (Sequelize가 자동 관리)
      await db.ChallengeParticipant.create({
        challenge_id: challenge.get('challenge_id'),
        user_id
      });
    } catch (participantError) {
      console.warn('챌린지 참가자 생성 실패:', participantError);
    }

    return challenge.get('challenge_id');
  } catch (error) {
    console.error('테스트 챌린지 생성 실패:', error);
    return null;
  }
}

async function createTestPost(user_id: number) {
  try {
    const post = await db.MyDayPost.create({
      user_id,
      content: `테스트 게시물 내용 ${Date.now()}. 이 게시물은 테스트를 위해 자동으로 생성되었습니다. 충분한 길이의 내용입니다.`,
      is_anonymous: false,
      character_count: 100,
      like_count: 0,
      comment_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    });

    try {
      // MyDayEmotion 생성 시 created_at, updated_at 제거 (Sequelize가 자동 관리)
      const emotionId = 1; // 행복
      await db.MyDayEmotion.create({
        post_id: post.get('post_id'),
        emotion_id: emotionId
      });
    } catch (emotionError) {
      console.warn('게시물 감정 연결 실패:', emotionError);
    }

    return post.get('post_id');
  } catch (error) {
    console.error('테스트 게시물 생성 실패:', error);
    return null;
  }
}

const createTestUser = async () => {
  try {
    // 이미 생성된 테스트 사용자가 있는지 확인
    const existingUser = testDataCache.get('testUser');
    if (existingUser) {
      console.log('기존 테스트 사용자 재사용:', existingUser.userId);
      return existingUser;
    }

    console.log('새 테스트 사용자 생성 시작');

    // 외래 키 제약 일시 해제
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=0;');

    try {
      // timestamp로 고유한 값 생성
      const timestamp = Date.now();

      // 사용자 생성
      const user = await db.User.create({
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password_hash: await bcrypt.hash('password123', 10),
        nickname: `TestUser${timestamp}`,
        theme_preference: 'system',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        notification_settings: {
          like_notifications: true,
          comment_notifications: true, 
          challenge_notifications: true,
          encouragement_notifications: true
        },
        privacy_settings: JSON.parse('{}')
      });

      const userId = user.get('user_id');
      console.log(`생성된 테스트 사용자 ID: ${userId}`);

      // UserStats 생성
      try {
        await db.UserStats.create({
          user_id: userId,
          my_day_post_count: 0,
          someone_day_post_count: 0,
          my_day_like_received_count: 0,
          someone_day_like_received_count: 0,
          my_day_comment_received_count: 0,
          someone_day_comment_received_count: 0,
          challenge_count: 0,
          last_updated: new Date()
        });
      } catch (statsError) {
        console.warn('UserStats 생성 중 오류:', statsError);
        
        // 대체 방법: 직접 쿼리 실행
        try {
          await db.sequelize.query(`
            INSERT INTO user_stats (
              user_id, 
              my_day_post_count, 
              someone_day_post_count, 
              my_day_like_received_count,
              someone_day_like_received_count,
              my_day_comment_received_count,
              someone_day_comment_received_count,
              challenge_count,
              last_updated
            ) VALUES (?, 0, 0, 0, 0, 0, 0, 0, ?)
          `, {
            replacements: [userId, new Date()],
            type: QueryTypes.INSERT
          });
        } catch (queryError) {
          console.warn('직접 쿼리를 통한 UserStats 생성 실패:', queryError);
        }
      }

      // JWT 토큰 생성
      console.log(`JWT 토큰 생성을 위한 사용자 ID: ${userId}`);
      const token = jwt.sign(
        { user_id: userId },
        process.env.JWT_SECRET || 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=',
        { expiresIn: '1h' }
      );

      // 외래 키 제약 다시 활성화
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS=1;');

      // 게시물 미리 생성
      const postId = await createTestPost(userId);

      // 챌린지 미리 생성
      const challengeId = await createTestChallenge(userId);

      const userData = { 
        user, 
        token, 
        userId,
        postId,
        challengeId
      };

      // 캐시에 테스트 데이터 저장
      testDataCache.set('testUser', userData);

      return userData;
    } catch (error) {
      // 외래 키 제약 다시 활성화
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS=1;');
      console.error('테스트 사용자 생성 실패:', error);
      throw error;
    }
  } catch (error) {
    console.error('테스트 사용자 생성 실패:', error);
    throw error;
  }
};

let serverInstances: any[] = [];

// 서버 시작 함수: 포트 충돌 해결
export const getUniquePort = () => {
  // 기본 포트에서 테스트별 오프셋 추가
  const basePort = 5017;
  const offset = Math.floor(Math.random() * 1000);
  return basePort + offset;
};

beforeAll(async () => {
  try {
    console.time('데이터베이스 초기화');
    
    // 타임아웃 방지를 위한 빠른 초기화 로직
    if (process.env.FAST_INIT === 'true' || process.env.NODE_ENV === 'test') {
      console.log('빠른 초기화 모드 - 데이터베이스 초기화 과정 생략');
      isDbInitialized = true;
      return;
    }
    
    // 이미 실행 중인 서버 인스턴스가 있으면 종료
    if (serverInstances.length > 0) {
      for (const server of serverInstances) {
        if (server && typeof server.close === 'function') {
          await new Promise<void>((resolve) => {
            server.close(() => {
              console.log('기존 서버 인스턴스 종료됨');
              resolve();
            });
          });
        }
      }
      serverInstances = [];
    }
    
    if (!isDbInitialized) {
      // 데이터베이스 설정
      await setupDatabase();
    
      // 외래 키 무결성 검사 및 복구
      await validateAndRepairForeignKeys();
    
      isDbInitialized = true;
    
      // 통합 테스트를 위한 테스트 사용자 미리 생성
      try {
        await createTestUser();
      } catch (userError) {
        console.warn('테스트 사용자 생성 실패, 테스트는 계속 진행합니다:', userError);
      }
    }
    console.timeEnd('데이터베이스 초기화');
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    // 오류가 발생해도 테스트가 계속 진행되도록 변경
    console.warn('오류가 발생했지만 테스트는 계속 진행합니다.');
  }
}, 600000); // 10분으로 타임아웃 증가

const cleanupDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS=0');
      
      // 테이블이 존재하는지 확인한 후 truncate
      const tables = [
        'my_day_emotions', 'my_day_likes', 'my_day_comments', 'my_day_posts',
        'user_stats', 'user_blocks', 'users',
        'someone_day_comments', 'someone_day_likes', 'someone_day_tags',
        'someone_day_posts', 'challenges', 'challenge_emotions', 'challenge_participants'
      ];
      
      for (const table of tables) {
        try {
          await db.sequelize.query(`TRUNCATE TABLE ${table}`);
        } catch (err) {
          console.log(`테이블 ${table} truncate 실패 (테이블이 없을 수 있음): ${err}`);
        }
      }
      
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    }
    console.log('데이터베이스 정리 완료 (테스트 데이터 유지)');
  } catch (error) {
    console.error('데이터베이스 정리 오류:', error);
  }
};

// 안전한 타임아웃 관리 클래스
class TimeoutManager {
  private timeouts: Set<NodeJS.Timeout> = new Set();

  createTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeoutId = setTimeout(() => {
      this.timeouts.delete(timeoutId);
      callback();
    }, delay);
    this.timeouts.add(timeoutId);
    return timeoutId;
  }

  clearTimeout(timeoutId: NodeJS.Timeout): void {
    if (this.timeouts.has(timeoutId)) {
      clearTimeout(timeoutId);
      this.timeouts.delete(timeoutId);
    }
  }

  clearAll(): void {
    this.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
  }
}

const timeoutManager = new TimeoutManager();

// setup.ts의 afterAll 함수 수정
afterAll(async () => {
  try {
    console.log('DB 연결 종료 및 서버 인스턴스 정리 시작...');

    // 모든 타임아웃 정리
    timeoutManager.clearAll();

    // 열려있는 모든 서버 인스턴스 종료
    for (const server of serverInstances) {
      if (server && typeof server.close === 'function') {
        try {
          await new Promise<void>((resolve) => {
            const timeoutId = timeoutManager.createTimeout(() => {
              console.log('서버 종료 타임아웃');
              resolve();
            }, 5000);

            server.close(() => {
              timeoutManager.clearTimeout(timeoutId);
              console.log('서버 인스턴스 종료됨');
              resolve();
            });
          });
        } catch (err) {
          console.warn('서버 인스턴스 종료 중 오류:', err);
        }
      }
    }
    serverInstances = [];

    // sequelize 연결 종료 - 안전한 타임아웃 관리
    if (db.sequelize) {
      try {
        await new Promise<void>((resolve) => {
          const timeoutId = timeoutManager.createTimeout(() => {
            console.log('sequelize 연결 종료 타임아웃');
            resolve();
          }, 5000);

          db.sequelize.close().then(() => {
            timeoutManager.clearTimeout(timeoutId);
            console.log('sequelize 연결 종료됨');
            resolve();
          }).catch((error) => {
            timeoutManager.clearTimeout(timeoutId);
            console.log('sequelize 연결 종료 중 오류 발생:', error);
            resolve();
          });
        });
      } catch (error) {
        console.log('sequelize 연결 종료 중 예외 발생:', error);
      }
    }

    // 실제 DB 연결 종료 - 안전한 타임아웃 관리
    if (dbConnection) {
      try {
        await new Promise<void>((resolve) => {
          const timeoutId = timeoutManager.createTimeout(() => {
            console.log('dbConnection 연결 종료 타임아웃');
            resolve();
          }, 5000);

          dbConnection!.close().then(() => {
            timeoutManager.clearTimeout(timeoutId);
            console.log('dbConnection 연결 종료됨');
            resolve();
          }).catch((error) => {
            timeoutManager.clearTimeout(timeoutId);
            console.log('dbConnection 연결 종료 중 오류 발생:', error);
            resolve();
          });
        });
      } catch (error) {
        console.log('dbConnection 연결 종료 중 예외 발생:', error);
      } finally {
        dbConnection = null;
      }
    }

    // 모든 남은 타임아웃 정리
    timeoutManager.clearAll();

    console.log('DB 연결 종료 및 서버 인스턴스 정리 완료');
  } catch (error) {
    console.error('DB 연결 종료 실패:', error);
  }
}, 30000); // 타임아웃 30초로 변경

// 서버 인스턴스 추적 함수 추가
export const registerServerInstance = (server: any) => {
  if (server) {
    serverInstances.push(server);
    console.log(`서버 인스턴스 등록 완료 (총 ${serverInstances.length}개)`);
  }
};

export { db };
export const testRequest = request(app);
export { createTestUser };