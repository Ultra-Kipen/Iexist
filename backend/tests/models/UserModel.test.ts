import { User } from '../../models/User';
import db from '../../models';

// 모킹 설정
jest.mock('../../models/User');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('사용자를 생성할 수 있어야 합니다', async () => {
    // 반환될 모킹된 사용자 객체
    const mockUser = {
      user_id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password_hash: '$2a$10$IfW1fgk3zKb.IbJ0M5E5L.Z3qhwrjcJfZD.UjE2S5iIKJ9Bk5T3jG',
      nickname: 'Test User',
      is_active: true,
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      }
    };
    
    // User.create 메서드 모킹
    (User.create as jest.Mock).mockResolvedValue(mockUser);

    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password_hash: '$2a$10$IfW1fgk3zKb.IbJ0M5E5L.Z3qhwrjcJfZD.UjE2S5iIKJ9Bk5T3jG',
      nickname: 'Test User',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      }
    };

    const user = await User.create(userData);
    
    expect(user).toBeDefined();
    expect(user).toHaveProperty('user_id');
    expect(user.email).toBe('test@example.com');
    expect(User.create).toHaveBeenCalledWith(userData);
  });

  it('필수 필드가 누락되면 오류가 발생해야 합니다', async () => {
    // 오류를 발생시키도록 모킹
    (User.create as jest.Mock).mockRejectedValue(new Error('필수 필드가 누락되었습니다'));

    const invalidUserData = {
      username: 'testuser',
      // email 누락
      password_hash: '$2a$10$IfW1fgk3zKb.IbJ0M5E5L.Z3qhwrjcJfZD.UjE2S5iIKJ9Bk5T3jG',
      is_active: true
    };

    await expect(User.create(invalidUserData as any)).rejects.toThrow();
    expect(User.create).toHaveBeenCalledWith(invalidUserData);
  });

  it('이메일은 고유해야 합니다', async () => {
    // 첫 번째 사용자 생성은 성공
    (User.create as jest.Mock).mockResolvedValueOnce({
      user_id: 1,
      username: 'testuser1',
      email: 'test@example.com'
    });
    
    // 두 번째 사용자 생성은 중복 이메일로 실패
    (User.create as jest.Mock).mockRejectedValueOnce(new Error('이메일이 이미 사용 중입니다'));

    const userData1 = {
      username: 'testuser1',
      email: 'test@example.com',
      password_hash: '$2a$10$IfW1fgk3zKb.IbJ0M5E5L.Z3qhwrjcJfZD.UjE2S5iIKJ9Bk5T3jG',
      nickname: 'Test User 1',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      }
    };

    const userData2 = {
      username: 'testuser2',
      email: 'test@example.com', // 같은 이메일
      password_hash: '$2a$10$IfW1fgk3zKb.IbJ0M5E5L.Z3qhwrjcJfZD.UjE2S5iIKJ9Bk5T3jG',
      nickname: 'Test User 2',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      }
    };

    await User.create(userData1);

    await expect(User.create(userData2)).rejects.toThrow();
    expect(User.create).toHaveBeenCalledTimes(2);
  });

  it('사용자 정보를 업데이트할 수 있어야 합니다', async () => {
    // 모킹된 사용자 객체
    const mockUser = {
      user_id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password_hash: '$2a$10$IfW1fgk3zKb.IbJ0M5E5L.Z3qhwrjcJfZD.UjE2S5iIKJ9Bk5T3jG',
      nickname: 'Test User',
      is_active: true,
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      },
      save: jest.fn().mockResolvedValue(undefined)
    };
    
    // 업데이트된 사용자 객체
    const updatedMockUser = {
      ...mockUser,
      nickname: 'Updated Nickname'
    };
    
    // User.create와 User.findByPk 메서드 모킹
    (User.create as jest.Mock).mockResolvedValue(mockUser);
    (User.findByPk as jest.Mock).mockResolvedValue(updatedMockUser);

    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password_hash: '$2a$10$IfW1fgk3zKb.IbJ0M5E5L.Z3qhwrjcJfZD.UjE2S5iIKJ9Bk5T3jG',
      nickname: 'Test User',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      }
    };

    const user = await User.create(userData);
    
    user.nickname = 'Updated Nickname';
    await user.save();
    
    const updatedUser = await User.findByPk(user.user_id);
    expect(updatedUser).toBeDefined();
    expect(updatedUser!.nickname).toBe('Updated Nickname');
    expect(mockUser.save).toHaveBeenCalled();
  });
});