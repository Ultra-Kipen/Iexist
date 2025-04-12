// root/backend/tests/unit/userController.test.ts
import request from 'supertest';
import { app } from '../../server';
import db from '../../models';

describe('User Controller', () => {
  // 모든 테스트 후에 실행
  afterAll(async () => {
    await db.sequelize.close();
  });

  it('should create a new user', async () => {
    const userData = {
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'password123!', // 특수문자 추가
      nickname: 'TestUser1'
    };
    const response = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.user).toMatchObject({
      username: userData.username,
      email: userData.email,
    });
  });
});