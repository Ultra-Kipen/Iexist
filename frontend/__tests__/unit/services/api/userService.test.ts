import axios, { AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import userService, { 
  UserStats, 
  UserProfile,
  ProfileUpdateData
} from '../../../../src/services/api/userService';

// localStorage 모킹
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// Node.js 환경에서 localStorage 모킹
if (typeof window === 'undefined') {
  global.localStorage = localStorageMock as any;
} else {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
}

// Jest를 사용하여 axios 모킹
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn()
      }
    }
  }),
  isAxiosError: jest.fn()
}));

describe('UserService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  // AxiosError 타입을 더 구체적으로 정의
  const createMockAxiosError = (
    errorResponse: any, 
    additionalConfig: Partial<InternalAxiosRequestConfig> = {}
  ): AxiosError => {
    const baseConfig: InternalAxiosRequestConfig = {
      method: 'get',
      url: '',
      headers: {} as AxiosRequestHeaders,
      ...additionalConfig
    };
  
    return {
      isAxiosError: true,
      response: { 
        data: errorResponse,
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: baseConfig
      },
      name: 'AxiosError',
      message: '에러 발생',
      config: baseConfig
    } as AxiosError;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // 기본적으로 모든 axios 메서드를 모킹
    (mockedAxios.create().get as jest.Mock).mockReset();
    (mockedAxios.create().put as jest.Mock).mockReset();
    (mockedAxios.create().post as jest.Mock).mockReset();
    (mockedAxios.create().delete as jest.Mock).mockReset();
    
    // isAxiosError를 기본값으로 설정
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  describe('getProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile: UserProfile = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        nickname: '테스트유저',
        theme_preference: 'light',
        privacy_settings: {
          show_profile: true,
          show_emotions: true,
          show_posts: true,
          show_challenges: true
        },
        last_login_at: '2024-04-22T10:00:00Z',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockResponse = {
        status: 'success',
        data: mockProfile
      };

      (mockedAxios.create().get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.getProfile();
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when fetching profile fails', async () => {
      const errorResponse = {
        status: 'error',
        message: '프로필 정보 조회에 실패했습니다.'
      };

      const mockError = createMockAxiosError(errorResponse, {
        headers: {} as AxiosRequestHeaders,
        method: 'get',
        url: '/users/profile'
      });

      (mockedAxios.create().get as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(userService.getProfile()).rejects.toEqual(errorResponse);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const profileData: ProfileUpdateData = {
        nickname: '새로운닉네임',
        favorite_quote: '오늘도 화이팅!'
      };

      const mockResponse = {
        status: 'success',
        message: '프로필이 성공적으로 업데이트되었습니다.'
      };

      (mockedAxios.create().put as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.updateProfile(profileData);
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when updating profile fails', async () => {
      const profileData: ProfileUpdateData = {
        nickname: '새로운닉네임'
      };

      const errorResponse = {
        status: 'error',
        message: '프로필 업데이트에 실패했습니다.'
      };

      const mockError = createMockAxiosError(errorResponse, {
        headers: {} as AxiosRequestHeaders,
        method: 'put',
        url: '/users/profile'
      });

      (mockedAxios.create().put as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(userService.updateProfile(profileData)).rejects.toEqual(errorResponse);
    });
  });

  describe('getUserById', () => {
    it('should fetch user profile by ID successfully', async () => {
      const userId = 1;
      const mockUserProfile: UserProfile = {
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com',
        nickname: '테스트유저',
        theme_preference: 'light',
        privacy_settings: {
          show_profile: true,
          show_emotions: true,
          show_posts: true,
          show_challenges: true
        },
        last_login_at: '2024-04-22T10:00:00Z',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockResponse = {
        status: 'success',
        data: mockUserProfile
      };

      (mockedAxios.create().get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.getUserById(userId);
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when fetching user profile fails', async () => {
      const userId = 1;
      const errorResponse = {
        status: 'error',
        message: '사용자 정보를 찾을 수 없습니다.'
      };

      const mockError = createMockAxiosError(errorResponse, {
        headers: {} as AxiosRequestHeaders,
        method: 'get',
        url: `/users/${userId}`
      });

      (mockedAxios.create().get as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(userService.getUserById(userId)).rejects.toEqual(errorResponse);
    });
  });

  describe('getUserStats', () => {
    it('should fetch user statistics successfully', async () => {
      const mockUserStats: UserStats = {
        my_day_post_count: 5,
        someone_day_post_count: 3,
        my_day_like_received_count: 10,
        someone_day_like_received_count: 7,
        my_day_comment_received_count: 4,
        someone_day_comment_received_count: 2,
        challenge_count: 1,
        last_updated: '2024-04-22T12:00:00Z'
      };

      const mockResponse = {
        status: 'success',
        data: mockUserStats
      };

      (mockedAxios.create().get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.getUserStats();
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when fetching user stats fails', async () => {
      const errorResponse = {
        status: 'error',
        message: '사용자 통계 정보를 가져올 수 없습니다.'
      };

      const mockError = createMockAxiosError(errorResponse, {
        headers: {} as AxiosRequestHeaders,
        method: 'get',
        url: '/users/stats'
      });

      (mockedAxios.create().get as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(userService.getUserStats()).rejects.toEqual(errorResponse);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const currentPassword = 'oldpassword123';
      const newPassword = 'newpassword456';

      const mockResponse = {
        status: 'success',
        message: '비밀번호가 성공적으로 변경되었습니다.'
      };

      (mockedAxios.create().put as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.changePassword(currentPassword, newPassword);
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when changing password fails', async () => {
      const currentPassword = 'oldpassword123';
      const newPassword = 'newpassword456';

      const errorResponse = {
        status: 'error',
        message: '비밀번호 변경에 실패했습니다.'
      };

      const mockError = createMockAxiosError(errorResponse, {
        headers: {} as AxiosRequestHeaders,
        method: 'put',
        url: '/users/password'
      });

      (mockedAxios.create().put as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(
        userService.changePassword(currentPassword, newPassword)
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('blockUser', () => {
    it('should block a user successfully', async () => {
      const userIdToBlock = 2;

      const mockResponse = {
        status: 'success',
        message: '사용자가 성공적으로 차단되었습니다.'
      };

      (mockedAxios.create().post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.blockUser(userIdToBlock);
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when blocking user fails', async () => {
      const userIdToBlock = 2;

      const errorResponse = {
        status: 'error',
        message: '사용자 차단에 실패했습니다.'
      };

      const mockError = createMockAxiosError(errorResponse, {
        headers: {} as AxiosRequestHeaders,
        method: 'post',
        url: `/users/block/${userIdToBlock}`
      });

      (mockedAxios.create().post as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(userService.blockUser(userIdToBlock)).rejects.toEqual(errorResponse);
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user successfully', async () => {
      const userIdToUnblock = 2;

      const mockResponse = {
        status: 'success',
        message: '사용자 차단이 해제되었습니다.'
      };

      (mockedAxios.create().delete as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.unblockUser(userIdToUnblock);
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when unblocking user fails', async () => {
      const userIdToUnblock = 2;

      const errorResponse = {
        status: 'error',
        message: '사용자 차단 해제에 실패했습니다.'
      };

      const mockError = createMockAxiosError(errorResponse, {
        headers: {} as AxiosRequestHeaders,
        method: 'delete',
        url: `/users/block/${userIdToUnblock}`
      });

      (mockedAxios.create().delete as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(userService.unblockUser(userIdToUnblock)).rejects.toEqual(errorResponse);
    });
  });

  describe('getBlockedUsers', () => {
    it('should fetch blocked users successfully', async () => {
      const mockBlockedUsers: UserProfile[] = [
        {
          user_id: 2,
          username: 'blockeduser1',
          email: 'blocked1@example.com',
          nickname: '차단된사용자1',
          theme_preference: 'dark',
          privacy_settings: {
            show_profile: false,
            show_emotions: false,
            show_posts: false,
            show_challenges: false
          },
          last_login_at: '2024-04-20T09:00:00Z',
          created_at: '2024-02-15T00:00:00Z'
        }
      ];

      const mockResponse = {
        status: 'success',
        data: mockBlockedUsers
      };

      (mockedAxios.create().get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.getBlockedUsers();
      
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when fetching blocked users fails', async () => {
      const errorResponse = {
        status: 'error',
        message: '차단된 사용자 목록을 가져올 수 없습니다.'
      };

      const mockError = createMockAxiosError(errorResponse, {
        headers: {} as AxiosRequestHeaders,
        method: 'get',
        url: '/users/blocked'
      });

      (mockedAxios.create().get as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(userService.getBlockedUsers()).rejects.toEqual(errorResponse);
    });
  });
});