// tests/helpers/testSetup.ts

import express from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from '../../middleware/corsMiddleware';
import { apiLimiter } from '../../middleware/rateLimitMiddleware';
import { configSecurity } from '../../middleware/securityMiddleware';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config/config';
import db from '../../models';
import { sequelize } from '../../config/database';

// 테스트용 앱 생성 함수
export const createTestApp = (useRateLimit: boolean = false) => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(corsMiddleware);
  configSecurity(app);
  
  if (useRateLimit) {
    app.use(apiLimiter);
  }

  return app;
};

// DB 초기화 함수
export const clearDatabase = async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  const tables = [
    'my_day_likes',
    'my_day_comments',
    'my_day_emotions',
    'my_day_posts',
    'users'
  ];

  for (const table of tables) {
    await sequelize.query(`TRUNCATE TABLE ${table}`);
  }
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
};

// 테스트 사용자 생성 함수
export const createTestUser = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await db.User.create({
    username: 'testuser',
    email: 'test@example.com',
    password_hash: hashedPassword,
    nickname: 'TestUser',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  });

  const token = jwt.sign(
    { user_id: user.get('user_id') },
    config.security.jwtSecret,
    { expiresIn: '1h' }
  );

  return { user, token };
};

// 기본 감정 데이터 생성 함수
export const createDefaultEmotions = async () => {
  await db.Emotion.bulkCreate([
    {
      emotion_id: 1,
      name: '행복',
      icon: 'emoticon-happy-outline',
      color: '#FFD700',
      created_at: new Date(),
      updated_at: new Date()
    },
    // 필요한 다른 감정 데이터
  ]);
};

export const baseURL = '/api';