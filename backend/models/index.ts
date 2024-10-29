import { Sequelize } from 'sequelize';
import { User } from './user'; // User를 named import로 가져옵니다.

const sequelize = new Sequelize(/* 설정 */);

export { sequelize, User }; // named export로 sequelize와 User를 내보냅니다.
describe('User 모델 테스트', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('사용자를 생성할 수 있어야 합니다', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      nickname: 'Test User',
      themePreference: 'light' as const,
      privacySettings: {}
    };

    const user = await User.create(userData);
    
    expect(user).toBeDefined();
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(await user.validatePassword('password123')).toBe(true);
  });

  it('중복된 이메일로 사용자를 생성할 수 없어야 합니다', async () => {
    const userData = {
      username: 'anotheruser',
      email: 'test@example.com', // 이미 존재하는 이메일
      password: 'password123',
      nickname: 'Another User',
      themePreference: 'light' as const,
      privacySettings: {}
    };

    await expect(User.create(userData)).rejects.toThrow();
  });
});
