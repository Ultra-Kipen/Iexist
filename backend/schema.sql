
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
