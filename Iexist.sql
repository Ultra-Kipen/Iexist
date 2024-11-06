-- 사용자 테이블
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    profile_image_url VARCHAR(255),
    background_image_url VARCHAR(255),
    favorite_quote VARCHAR(255),
    theme_preference ENUM('light', 'dark', 'system'),
    privacy_settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 감정 테이블
CREATE TABLE emotions (
    emotion_id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(10) NOT NULL
);

-- 사용자 게시물 테이블
CREATE TABLE my_day_posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    emotion_summary VARCHAR(100),
    image_url VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT FALSE,
    character_count SMALLINT UNSIGNED,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 사용자 게시물 댓글 테이블
CREATE TABLE my_day_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content VARCHAR(500) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES my_day_posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 사용자 게시물 좋아요 테이블
CREATE TABLE my_day_likes (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (post_id) REFERENCES my_day_posts(post_id)
);

-- 사용자 게시물 감정 태그 테이블
CREATE TABLE my_day_emotions (
    post_id INT NOT NULL,
    emotion_id TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (post_id, emotion_id),
    FOREIGN KEY (post_id) REFERENCES my_day_posts(post_id),
    FOREIGN KEY (emotion_id) REFERENCES emotions(emotion_id)
);

-- 커뮤니티 게시물 테이블
CREATE TABLE someone_day_posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(200),
    image_url VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT FALSE,
    character_count SMALLINT UNSIGNED,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 커뮤니티 게시물 좋아요 테이블
CREATE TABLE someone_day_likes (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (post_id) REFERENCES someone_day_posts(post_id)
);

-- 태그 테이블
CREATE TABLE tags (
    tag_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 커뮤니티 게시물 태그 테이블
CREATE TABLE someone_day_tags (
    post_id INT NOT NULL,
    tag_id SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES someone_day_posts(post_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);

-- 챌린지 테이블
CREATE TABLE challenges (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    max_participants SMALLINT UNSIGNED,
    participant_count SMALLINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id)
);

-- 챌린지 참가자 테이블
CREATE TABLE challenge_participants (
    challenge_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (challenge_id, user_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 챌린지 감정 로그 테이블
CREATE TABLE challenge_emotions (
    challenge_emotion_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    user_id INT NOT NULL,
    emotion_id TINYINT UNSIGNED NOT NULL,
    log_date DATE NOT NULL,
    note VARCHAR(200),
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (emotion_id) REFERENCES emotions(emotion_id)
);

-- 사용자 활동 통계 테이블
CREATE TABLE user_stats (
    user_id INT PRIMARY KEY,
    my_day_post_count INT DEFAULT 0,
    someone_day_post_count INT DEFAULT 0,
    my_day_like_received_count INT DEFAULT 0,
    someone_day_like_received_count INT DEFAULT 0,
    my_day_comment_received_count INT DEFAULT 0,
    someone_day_comment_received_count INT DEFAULT 0,
    challenge_count SMALLINT UNSIGNED DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 알림 테이블
CREATE TABLE notifications (
    user_id INT NOT NULL,
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(255) NOT NULL,
    notification_type ENUM('like', 'comment', 'challenge', 'system') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 게시물 추천 테이블
CREATE TABLE post_recommendations (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    recommended_post_id INT NOT NULL,
    post_type ENUM('my_day', 'someone_day') NOT NULL,
    reason VARCHAR(100)
);

-- 베스트 게시물 테이블
CREATE TABLE best_posts (
    best_post_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    post_type ENUM('my_day', 'someone_day') NOT NULL,
    category ENUM('weekly', 'monthly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- 사용자 감정 로그 테이블
CREATE TABLE emotion_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    emotion_id TINYINT UNSIGNED NOT NULL,
    log_date DATE NOT NULL,
    note VARCHAR(200),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (emotion_id) REFERENCES emotions(emotion_id),
    INDEX idx_user_date (user_id, log_date)
);

-- 사용자 목표 테이블
CREATE TABLE user_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_emotion_id TINYINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress TINYINT UNSIGNED DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (target_emotion_id) REFERENCES emotions(emotion_id)
);

-- 응원 메시지 테이블
CREATE TABLE encouragement_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    post_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id),
    FOREIGN KEY (post_id) REFERENCES someone_day_posts(post_id)
);