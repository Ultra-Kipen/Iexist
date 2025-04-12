-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- 생성 시간: 25-03-16 16:11
-- 서버 버전: 10.4.32-MariaDB
-- PHP 버전: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 데이터베이스: `iexist`
--

-- --------------------------------------------------------

--
-- 테이블 구조 `best_posts`
--

CREATE TABLE `best_posts` (
  `best_post_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `post_type` enum('my_day','someone_day') NOT NULL,
  `category` enum('weekly','monthly') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `challenges`
--

CREATE TABLE `challenges` (
  `challenge_id` int(11) NOT NULL,
  `creator_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `max_participants` int(11) DEFAULT NULL,
  `participant_count` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `challenge_emotions`
--

CREATE TABLE `challenge_emotions` (
  `challenge_emotion_id` int(11) NOT NULL,
  `challenge_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emotion_id` tinyint(3) UNSIGNED NOT NULL,
  `log_date` date NOT NULL,
  `note` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `challenge_participants`
--

CREATE TABLE `challenge_participants` (
  `challenge_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `emotions`
--

CREATE TABLE `emotions` (
  `emotion_id` tinyint(3) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `color` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 테이블의 덤프 데이터 `emotions`
--

INSERT INTO `emotions` (`emotion_id`, `name`, `icon`, `color`, `created_at`, `updated_at`) VALUES
(1, '행복', 'emoticon-happy-outline', '#FFD700', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(2, '감사', 'hand-heart', '#FF69B4', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(3, '위로', 'hand-peace', '#87CEEB', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(4, '감동', 'heart-outline', '#FF6347', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(5, '슬픔', 'emoticon-sad-outline', '#4682B4', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(6, '불안', 'alert-outline', '#DDA0DD', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(7, '화남', 'emoticon-angry-outline', '#FF4500', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(8, '지침', 'emoticon-neutral-outline', '#A9A9A9', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(9, '우울', 'weather-cloudy', '#708090', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(10, '고독', 'account-outline', '#8B4513', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(11, '충격', 'lightning-bolt', '#9932CC', '2024-12-14 16:15:36', '2024-12-14 16:15:36'),
(12, '편함', 'sofa-outline', '#32CD32', '2024-12-14 16:15:36', '2024-12-14 16:15:36');

-- --------------------------------------------------------

--
-- 테이블 구조 `emotion_logs`
--

CREATE TABLE `emotion_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emotion_id` tinyint(3) UNSIGNED NOT NULL,
  `note` varchar(200) DEFAULT NULL,
  `log_date` date NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `encouragement_messages`
--

CREATE TABLE `encouragement_messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `my_day_comments`
--

CREATE TABLE `my_day_comments` (
  `comment_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` varchar(500) NOT NULL,
  `is_anonymous` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `my_day_emotions`
--

CREATE TABLE `my_day_emotions` (
  `post_id` int(11) NOT NULL,
  `emotion_id` tinyint(3) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `my_day_likes`
--

CREATE TABLE `my_day_likes` (
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `my_day_posts`
--

CREATE TABLE `my_day_posts` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `emotion_summary` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `character_count` smallint(5) UNSIGNED DEFAULT NULL,
  `like_count` int(11) NOT NULL DEFAULT 0,
  `comment_count` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` varchar(255) NOT NULL,
  `notification_type` enum('like','comment','challenge','system') NOT NULL,
  `related_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `post_recommendations`
--

CREATE TABLE `post_recommendations` (
  `recommendation_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `recommended_post_id` int(11) NOT NULL,
  `post_type` enum('my_day','someone_day') NOT NULL,
  `reason` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `post_reports`
--

CREATE TABLE `post_reports` (
  `report_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `report_type` enum('spam','inappropriate','harassment','other','content') NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `post_tags`
--

CREATE TABLE `post_tags` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- 테이블의 덤프 데이터 `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20241212070037-init_challenge_emotions.js'),
('20241214060338-update_challenge_emotions_table.js'),
('20241214155447-modify-challenge-emotions.js');

-- --------------------------------------------------------

--
-- 테이블 구조 `someone_day_comments`
--

CREATE TABLE `someone_day_comments` (
  `comment_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` varchar(500) NOT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `someone_day_likes`
--

CREATE TABLE `someone_day_likes` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `someone_day_posts`
--

CREATE TABLE `someone_day_posts` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `summary` varchar(200) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `character_count` int(11) DEFAULT NULL,
  `like_count` int(11) NOT NULL DEFAULT 0,
  `comment_count` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `someone_day_tags`
--

CREATE TABLE `someone_day_tags` (
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `tags`
--

CREATE TABLE `tags` (
  `tag_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `background_image_url` varchar(255) DEFAULT NULL,
  `favorite_quote` varchar(255) DEFAULT NULL,
  `theme_preference` enum('light','dark','system') DEFAULT 'system',
  `privacy_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`privacy_settings`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `notification_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`notification_settings`)),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `user_blocks`
--

CREATE TABLE `user_blocks` (
  `user_id` int(11) NOT NULL,
  `blocked_user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `user_goal`
--

CREATE TABLE `user_goal` (
  `goal_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `target_emotion_id` tinyint(3) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `progress` tinyint(3) UNSIGNED DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `user_goals`
--

CREATE TABLE `user_goals` (
  `goal_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `target_emotion_id` tinyint(3) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 테이블 구조 `user_stats`
--

CREATE TABLE `user_stats` (
  `user_id` int(11) NOT NULL,
  `my_day_post_count` int(11) NOT NULL DEFAULT 0,
  `someone_day_post_count` int(11) NOT NULL DEFAULT 0,
  `my_day_like_received_count` int(11) NOT NULL DEFAULT 0,
  `someone_day_like_received_count` int(11) NOT NULL DEFAULT 0,
  `my_day_comment_received_count` int(11) NOT NULL DEFAULT 0,
  `someone_day_comment_received_count` int(11) NOT NULL DEFAULT 0,
  `challenge_count` int(11) NOT NULL DEFAULT 0,
  `last_updated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 덤프된 테이블의 인덱스
--

--
-- 테이블의 인덱스 `best_posts`
--
ALTER TABLE `best_posts`
  ADD PRIMARY KEY (`best_post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- 테이블의 인덱스 `challenges`
--
ALTER TABLE `challenges`
  ADD PRIMARY KEY (`challenge_id`),
  ADD KEY `creator_id` (`creator_id`);

--
-- 테이블의 인덱스 `challenge_emotions`
--
ALTER TABLE `challenge_emotions`
  ADD PRIMARY KEY (`challenge_emotion_id`),
  ADD KEY `challenge_id` (`challenge_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `emotion_id` (`emotion_id`);

--
-- 테이블의 인덱스 `challenge_participants`
--
ALTER TABLE `challenge_participants`
  ADD PRIMARY KEY (`challenge_id`,`user_id`),
  ADD UNIQUE KEY `challenge_participants_challenge_id_user_id_unique` (`challenge_id`,`user_id`),
  ADD UNIQUE KEY `challenge_participants_challenge_id_user_id` (`challenge_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 테이블의 인덱스 `emotions`
--
ALTER TABLE `emotions`
  ADD PRIMARY KEY (`emotion_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- 테이블의 인덱스 `emotion_logs`
--
ALTER TABLE `emotion_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `emotion_id` (`emotion_id`);

--
-- 테이블의 인덱스 `encouragement_messages`
--
ALTER TABLE `encouragement_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `encouragement_messages_sender_id` (`sender_id`),
  ADD KEY `encouragement_messages_receiver_id` (`receiver_id`),
  ADD KEY `encouragement_messages_post_id` (`post_id`),
  ADD KEY `encouragement_messages_created_at` (`created_at`);

--
-- 테이블의 인덱스 `my_day_comments`
--
ALTER TABLE `my_day_comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `my_day_comments_post_id` (`post_id`),
  ADD KEY `my_day_comments_user_id` (`user_id`);

--
-- 테이블의 인덱스 `my_day_emotions`
--
ALTER TABLE `my_day_emotions`
  ADD PRIMARY KEY (`post_id`,`emotion_id`),
  ADD UNIQUE KEY `my_day_emotions_post_id_emotion_id_unique` (`post_id`,`emotion_id`),
  ADD KEY `my_day_emotions_post_id` (`post_id`),
  ADD KEY `my_day_emotions_emotion_id` (`emotion_id`);

--
-- 테이블의 인덱스 `my_day_likes`
--
ALTER TABLE `my_day_likes`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `my_day_likes_post_id` (`post_id`),
  ADD KEY `my_day_likes_user_id` (`user_id`);

--
-- 테이블의 인덱스 `my_day_posts`
--
ALTER TABLE `my_day_posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 테이블의 인덱스 `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_is_read` (`user_id`,`is_read`),
  ADD KEY `notifications_created_at` (`created_at`);

--
-- 테이블의 인덱스 `post_recommendations`
--
ALTER TABLE `post_recommendations`
  ADD PRIMARY KEY (`recommendation_id`),
  ADD KEY `post_recommendations_post_id` (`post_id`),
  ADD KEY `post_recommendations_recommended_post_id` (`recommended_post_id`);

--
-- 테이블의 인덱스 `post_reports`
--
ALTER TABLE `post_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `post_reports_post_id` (`post_id`),
  ADD KEY `post_reports_reporter_id` (`reporter_id`),
  ADD KEY `post_reports_status` (`status`),
  ADD KEY `post_reports_created_at` (`created_at`);

--
-- 테이블의 인덱스 `post_tags`
--
ALTER TABLE `post_tags`
  ADD PRIMARY KEY (`post_id`,`tag_id`),
  ADD KEY `post_tags_post_id` (`post_id`),
  ADD KEY `post_tags_tag_id` (`tag_id`);

--
-- 테이블의 인덱스 `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- 테이블의 인덱스 `someone_day_comments`
--
ALTER TABLE `someone_day_comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `someone_day_comments_post_id` (`post_id`),
  ADD KEY `someone_day_comments_user_id` (`user_id`);

--
-- 테이블의 인덱스 `someone_day_likes`
--
ALTER TABLE `someone_day_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `someone_day_likes_post_id_user_id` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 테이블의 인덱스 `someone_day_posts`
--
ALTER TABLE `someone_day_posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `someone_day_posts_user_id` (`user_id`),
  ADD KEY `someone_day_posts_created_at` (`created_at`),
  ADD KEY `someone_day_posts_like_count` (`like_count`);

--
-- 테이블의 인덱스 `someone_day_tags`
--
ALTER TABLE `someone_day_tags`
  ADD PRIMARY KEY (`post_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- 테이블의 인덱스 `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`tag_id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `tags_name` (`name`);

--
-- 테이블의 인덱스 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- 테이블의 인덱스 `user_blocks`
--
ALTER TABLE `user_blocks`
  ADD PRIMARY KEY (`user_id`,`blocked_user_id`),
  ADD KEY `blocked_user_id` (`blocked_user_id`);

--
-- 테이블의 인덱스 `user_goal`
--
ALTER TABLE `user_goal`
  ADD PRIMARY KEY (`goal_id`),
  ADD KEY `target_emotion_id` (`target_emotion_id`),
  ADD KEY `idx_user_date` (`user_id`,`start_date`);

--
-- 테이블의 인덱스 `user_goals`
--
ALTER TABLE `user_goals`
  ADD PRIMARY KEY (`goal_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `target_emotion_id` (`target_emotion_id`);

--
-- 테이블의 인덱스 `user_stats`
--
ALTER TABLE `user_stats`
  ADD PRIMARY KEY (`user_id`);

--
-- 덤프된 테이블의 AUTO_INCREMENT
--

--
-- 테이블의 AUTO_INCREMENT `best_posts`
--
ALTER TABLE `best_posts`
  MODIFY `best_post_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `challenges`
--
ALTER TABLE `challenges`
  MODIFY `challenge_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 테이블의 AUTO_INCREMENT `challenge_emotions`
--
ALTER TABLE `challenge_emotions`
  MODIFY `challenge_emotion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `emotions`
--
ALTER TABLE `emotions`
  MODIFY `emotion_id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- 테이블의 AUTO_INCREMENT `emotion_logs`
--
ALTER TABLE `emotion_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `encouragement_messages`
--
ALTER TABLE `encouragement_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `my_day_comments`
--
ALTER TABLE `my_day_comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `my_day_posts`
--
ALTER TABLE `my_day_posts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `post_recommendations`
--
ALTER TABLE `post_recommendations`
  MODIFY `recommendation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `post_reports`
--
ALTER TABLE `post_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `someone_day_comments`
--
ALTER TABLE `someone_day_comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `someone_day_likes`
--
ALTER TABLE `someone_day_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `someone_day_posts`
--
ALTER TABLE `someone_day_posts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `tags`
--
ALTER TABLE `tags`
  MODIFY `tag_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 테이블의 AUTO_INCREMENT `user_goal`
--
ALTER TABLE `user_goal`
  MODIFY `goal_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 테이블의 AUTO_INCREMENT `user_goals`
--
ALTER TABLE `user_goals`
  MODIFY `goal_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 덤프된 테이블의 제약사항
--

--
-- 테이블의 제약사항 `best_posts`
--
ALTER TABLE `best_posts`
  ADD CONSTRAINT `best_posts_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `someone_day_posts` (`post_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `challenges`
--
ALTER TABLE `challenges`
  ADD CONSTRAINT `challenges_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `challenge_emotions`
--
ALTER TABLE `challenge_emotions`
  ADD CONSTRAINT `challenge_emotions_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`challenge_id`),
  ADD CONSTRAINT `challenge_emotions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `challenge_emotions_ibfk_3` FOREIGN KEY (`emotion_id`) REFERENCES `emotions` (`emotion_id`);

--
-- 테이블의 제약사항 `challenge_participants`
--
ALTER TABLE `challenge_participants`
  ADD CONSTRAINT `challenge_participants_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`challenge_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `challenge_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `emotion_logs`
--
ALTER TABLE `emotion_logs`
  ADD CONSTRAINT `emotion_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `emotion_logs_ibfk_2` FOREIGN KEY (`emotion_id`) REFERENCES `emotions` (`emotion_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `encouragement_messages`
--
ALTER TABLE `encouragement_messages`
  ADD CONSTRAINT `encouragement_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `encouragement_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `encouragement_messages_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `someone_day_posts` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `my_day_comments`
--
ALTER TABLE `my_day_comments`
  ADD CONSTRAINT `my_day_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `my_day_posts` (`post_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `my_day_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `my_day_emotions`
--
ALTER TABLE `my_day_emotions`
  ADD CONSTRAINT `my_day_emotions_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `my_day_posts` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `my_day_emotions_ibfk_2` FOREIGN KEY (`emotion_id`) REFERENCES `emotions` (`emotion_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `my_day_likes`
--
ALTER TABLE `my_day_likes`
  ADD CONSTRAINT `my_day_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `my_day_likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `my_day_posts` (`post_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `my_day_posts`
--
ALTER TABLE `my_day_posts`
  ADD CONSTRAINT `my_day_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `post_recommendations`
--
ALTER TABLE `post_recommendations`
  ADD CONSTRAINT `post_recommendations_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `someone_day_posts` (`post_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `post_recommendations_ibfk_2` FOREIGN KEY (`recommended_post_id`) REFERENCES `someone_day_posts` (`post_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `post_reports`
--
ALTER TABLE `post_reports`
  ADD CONSTRAINT `post_reports_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `someone_day_posts` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `post_reports_ibfk_2` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `post_tags`
--
ALTER TABLE `post_tags`
  ADD CONSTRAINT `post_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `someone_day_posts` (`post_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `someone_day_comments`
--
ALTER TABLE `someone_day_comments`
  ADD CONSTRAINT `someone_day_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `someone_day_posts` (`post_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `someone_day_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `someone_day_likes`
--
ALTER TABLE `someone_day_likes`
  ADD CONSTRAINT `someone_day_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `someone_day_posts` (`post_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `someone_day_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `someone_day_posts`
--
ALTER TABLE `someone_day_posts`
  ADD CONSTRAINT `someone_day_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `someone_day_tags`
--
ALTER TABLE `someone_day_tags`
  ADD CONSTRAINT `someone_day_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `someone_day_posts` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `someone_day_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `user_blocks`
--
ALTER TABLE `user_blocks`
  ADD CONSTRAINT `user_blocks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_blocks_ibfk_2` FOREIGN KEY (`blocked_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `user_goal`
--
ALTER TABLE `user_goal`
  ADD CONSTRAINT `user_goal_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_goal_ibfk_2` FOREIGN KEY (`target_emotion_id`) REFERENCES `emotions` (`emotion_id`);

--
-- 테이블의 제약사항 `user_goals`
--
ALTER TABLE `user_goals`
  ADD CONSTRAINT `user_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `user_goals_ibfk_2` FOREIGN KEY (`target_emotion_id`) REFERENCES `emotions` (`emotion_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- 테이블의 제약사항 `user_stats`
--
ALTER TABLE `user_stats`
  ADD CONSTRAINT `user_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
