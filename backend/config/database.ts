import { Sequelize, Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config: { [key: string]: Options } = {
  development: {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'Iexist',
    password: process.env.DB_PASSWORD || 'sw309824!@',
    database: process.env.DB_NAME || 'iexist',
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
      multipleStatements: true,
      connectTimeout: 60000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    retry: {
      max: 3
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  },
  test: {
    dialect: 'mysql', // sqlite에서 mysql로 변경
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'Iexist',
    password: process.env.DB_PASSWORD || 'sw309824!@',
    database: process.env.DB_NAME || 'iexist_test',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  },
  production: {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    define: {
      timestamps: true,
      underscored: true
    },
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
      multipleStatements: true,
      connectTimeout: 60000
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    logging: false
  }
};

const sequelize = new Sequelize(config[env]);

// 데이터베이스 연결 테스트 함수
export const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    return false;
  }
};

export { sequelize };
export default sequelize;