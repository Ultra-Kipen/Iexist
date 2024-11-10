import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../config';
import { sequelize } from '../config/database';
import { app } from '../server';

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('테스트 DB 초기화 실패:', error);
    throw error;
  }
});

beforeEach(async () => {
  try {
    await clearDatabase();
  } catch (error) {
    console.error('테스트 데이터 초기화 실패:', error);
    throw error;
  }
});

afterAll(async () => {
  await sequelize.close();
});

export const createTestUser = async () => {
  const user = await sequelize.models.users.create({
    username: 'testuser',
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 10),
    nickname: 'TestUser'
  });

  const token = jwt.sign(
    { id: user.get('user_id') },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, token };
};

export const testRequest = request(app);

export const authenticatedRequest = (token: string) => {
  return testRequest.set('Authorization', `Bearer ${token}`);
};

export const baseURL = '/api';

export const clearDatabase = async () => {
  try {
    if (sequelize.getDialect() === 'mysql') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.truncate({ cascade: true, force: true });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } else {
      await Promise.all(
        Object.values(sequelize.models).map(model => model.destroy({ 
          truncate: true, 
          cascade: true, 
          force: true 
        }))
      );
    }
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    throw error;
  }
};