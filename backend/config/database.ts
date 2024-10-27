// backend/config/database.ts

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'iexist',
  process.env.DB_USER || 'Iexist',
  process.env.DB_PASSWORD || 'sw309824!@',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    timezone: '+09:00',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      underscored: true,
      freezeTableName: false,
      timestamps: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logQueryParameters: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

export default sequelize;