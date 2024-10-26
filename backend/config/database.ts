// backend/config/database.ts

import { Sequelize } from 'sequelize';
import config from './config';

const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port || 3306,
    dialect: config.database.dialect,
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
