// backend/config/database.ts

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'Iexist',
  password: process.env.DB_PASSWORD || 'sw309824!@',
  database: process.env.DB_NAME || 'iexist',
  logging: process.env.NODE_ENV !== 'production' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4'
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;