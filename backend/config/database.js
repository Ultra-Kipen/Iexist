const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
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
      charset: 'utf8mb4'
    },
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
      multipleStatements: true,
      connectTimeout: 60000,
      charset: 'utf8mb4',
      decimalNumbers: true
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
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'Iexist', 
    password: process.env.DB_PASSWORD || 'sw309824!@',
    database: process.env.DB_NAME || 'iexist',
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4'
    },
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
      multipleStatements: true,
      connectTimeout: 60000,
      charset: 'utf8mb4',
      decimalNumbers: true
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
    logging: false
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
      underscored: true,
      charset: 'utf8mb4'
    },
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
      multipleStatements: true,
      connectTimeout: 60000,
      charset: 'utf8mb4',
      decimalNumbers: true
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    retry: {
      max: 3
    },
    logging: false
  }
};

const sequelize = new Sequelize(config[env]);

// 연결 직후 문자셋 설정을 위한 함수
const setCharset = async () => {
  try {
    await sequelize.query("SET NAMES utf8mb4");
    await sequelize.query("SET CHARACTER SET utf8mb4");
    await sequelize.query("SET character_set_connection=utf8mb4");
  } catch (error) {
    console.error('문자셋 설정 실패:', error);
  }
};

const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    await setCharset(); // 연결 성공 후 문자셋 설정
    console.log('데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    return false;
  }
};

module.exports = sequelize;
module.exports.testDatabaseConnection = testDatabaseConnection;
module.exports.Sequelize = Sequelize;