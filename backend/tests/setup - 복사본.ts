import { Sequelize, Transaction } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

let transaction: Transaction | null = null;

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
  try {
    if (transaction) {
      await transaction.rollback();
      transaction = null;
    }
  } catch (error: any) {
    if (!error.message.includes('Transaction cannot be rolled back')) {
      console.error('Error rolling back transaction:', error);
    }
  }
});

export { sequelize, transaction };