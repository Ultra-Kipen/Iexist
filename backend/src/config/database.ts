import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// .env 파일 경로 설정
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const env = process.env.NODE_ENV || 'development';
let sequelize: Sequelize;

const defaultOptions = {
  dialect: 'mysql' as const,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  logging: console.log
};

// 기본 development 환경 설정
sequelize = new Sequelize(
  process.env.DB_NAME || 'Iexist',
  process.env.DB_USER || 'Iexist',
  process.env.DB_PASSWORD,
  {
    ...defaultOptions,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306')
  }
);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

export default sequelize;