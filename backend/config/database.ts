import { Sequelize, Options, Dialect } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
      freezeTableName: true
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
    database: process.env.NODE_ENV === 'test' ? 'iexist_test' : process.env.DB_NAME, // 여기를 수정
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
// sequelize 초기화 방식 변경
const sequelizeConfig: Options = {
  ...config[env],
  dialect: 'mysql' as Dialect,
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    freezeTableName: true
  }
};

const sequelize = new Sequelize(
  process.env.NODE_ENV === 'test' ? 'iexist_test' : process.env.DB_NAME!,  // 여기를 수정
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  sequelizeConfig
);

const setCharset = async () => {
  try {
    await sequelize.query("SET NAMES utf8mb4");
    await sequelize.query("SET CHARACTER SET utf8mb4");
    await sequelize.query("SET character_set_connection=utf8mb4");
  } catch (error) {
    console.error('문자셋 설정 실패:', error);
  }
};

export const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    await setCharset();
    console.log('데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    return false;
  }
};
testDatabaseConnection(); // 즉시 연결 테스트 실행

export { sequelize };
export default sequelize;