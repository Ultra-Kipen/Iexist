import dotenv from 'dotenv';
import path from 'path';

// 환경별 .env 파일 로드
const envFile = process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const config = {
  app: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL,
    frontendUrl: process.env.FRONTEND_URL,
  },
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(','),
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
};