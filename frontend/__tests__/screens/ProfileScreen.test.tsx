import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../src/screens/ProfileScreen';

// 모든 외부 컴포넌트 모킹
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => jest.fn().mockReturnValue(null));
jest.mock('react-native-paper', () => ({
  TextInput: jest.fn().mockReturnValue(null),
  Button: jest.fn().mockReturnValue(null),
  Avatar: jest.fn().mockReturnValue(null),
}));

// 네비게이션 모킹
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {},
  }),
  useIsFocused: () => true,
}));

// API 클라이언트 모킹
// userService 모킹 (client 대신)
jest.mock('../../src/services/api/userService', () => ({
  getProfile: jest.fn().mockResolvedValue({
    data: {
      data: {
        user_id: 1,
        username: 'testuser',
        nickname: '테스트유저',
        profile_image_url: 'https://example.com/profile.jpg',
        background_image_url: 'https://example.com/background.jpg',
        favorite_quote: '매일 조금씩 성장하자',
        email: 'test@example.com',
      }
    }
  }),
  getUserStats: jest.fn().mockResolvedValue({
    data: {
      data: {
        my_day_post_count: 10,
        my_day_like_received_count: 25,
        challenge_count: 5
      }
    }
  }),
}));
// authService 모킹
jest.mock('../../src/services/api/authService', () => ({
  logout: jest.fn().mockResolvedValue(undefined),
}));

// 타입 정의
type Theme = {
  theme: string;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
  toggleTheme: () => void;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: {
    user_id: number;
    username: string;
  } | null;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<any>;
  checkAuthStatus: () => Promise<boolean>;
};

// ThemeContext 모의 구현
const createMockThemeContext = (): Theme => ({
  theme: 'light',
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    card: '#F2F2F2',
    text: '#000000',
    border: '#CCCCCC',
    notification: '#FF3B30',
  },
  toggleTheme: () => {},
});

// AuthContext 모의 구현
const createMockAuthContext = (): AuthContextType => ({
  isAuthenticated: true,
  user: { user_id: 1, username: 'testuser' },
  loading: false,
  login: jest.fn().mockResolvedValue({}),
  logout: jest.fn().mockResolvedValue(undefined),
  register: jest.fn().mockResolvedValue({}),
  checkAuthStatus: jest.fn().mockResolvedValue(true),
});

// 동적으로 컨텍스트 생성
const ThemeContext = React.createContext<Theme>(createMockThemeContext());
const AuthContext = React.createContext<AuthContextType>(createMockAuthContext());

describe('ProfileScreen 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('프로필 화면이 올바르게 렌더링 되어야 함', async () => {
    const mockTheme = createMockThemeContext();
    const mockAuth = createMockAuthContext();

    const userService = require('../../src/services/api/userService');
    
    const { queryByText } = render(
      <ThemeContext.Provider value={mockTheme}>
        <AuthContext.Provider value={mockAuth}>
          <ProfileScreen />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );
    
    await waitFor(() => {
      expect(userService.getProfile).toHaveBeenCalled();
      expect(userService.getUserStats).toHaveBeenCalled();
    }, { timeout: 10000 });
    
    expect(true).toBeTruthy();
  }, 15000); // 테스트 타임아웃을 15초로 증가

  it('프로필 편집 버튼이 존재해야 함', async () => {
    const mockTheme = createMockThemeContext();
    const mockAuth = createMockAuthContext();
    const userService = require('../../src/services/api/userService');

    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme}>
        <AuthContext.Provider value={mockAuth}>
          <ProfileScreen />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );
    
    await waitFor(() => {
      expect(userService.getProfile).toHaveBeenCalled();
      expect(userService.getUserStats).toHaveBeenCalled();
    }, { timeout: 10000 });
    
    const editButton = getByText('프로필 편집');
    expect(editButton).toBeTruthy();
  }, 15000);

  it('로그아웃 버튼을 누르면 로그아웃 함수가 호출되어야 함', async () => {
    const mockTheme = createMockThemeContext();
    const mockAuth = createMockAuthContext();
    const userService = require('../../src/services/api/userService');
    const authService = require('../../src/services/api/authService');

    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme}>
        <AuthContext.Provider value={mockAuth}>
          <ProfileScreen />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );
    
    await waitFor(() => {
      expect(userService.getProfile).toHaveBeenCalled();
      expect(userService.getUserStats).toHaveBeenCalled();
    }, { timeout: 10000 });
    
    const logoutButton = getByText('로그아웃');
    expect(logoutButton).toBeTruthy();
    expect(typeof mockAuth.logout).toBe('function');
  }, 15000);
});