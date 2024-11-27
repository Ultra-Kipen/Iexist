import { Sequelize, Transaction } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../.env') });

// 전역 transaction 변수
let transaction: Transaction;

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,          // 'iexist'
  password: process.env.DB_PASSWORD,      // 'sw309824!@'
  database: process.env.DB_NAME,          // 'iexist'
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

beforeEach(async () => {
  transaction = await sequelize.transaction();
});

afterEach(async () => {
  if (transaction) {
    await transaction.rollback();
  }
});

export { sequelize, transaction };