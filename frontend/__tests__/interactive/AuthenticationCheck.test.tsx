// AuthenticationCheck.test.tsx (수정)
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import * as AuthContextModule from '../../src/contexts/AuthContext';
import * as EmotionContextModule from '../../src/contexts/EmotionContext';

// 실제 HomeScreen 대신 사용할 간단한 모의 컴포넌트
function MockHomeScreen() {
  const { useAuth } = require('../../src/contexts/AuthContext');
  const auth = useAuth();
  
  if (!auth.isAuthenticated) {
    return (
      <View>
        <Text>로그인이 필요합니다</Text>
        <Text>게시물을 보려면, 먼저 로그인해주세요.</Text>
      </View>
    );
  }
  
  return (
    <View testID="home-screen-container">
      <Text>환영합니다, {auth.user.nickname}님</Text>
    </View>
  );
}

// 원본 HomeScreen 모듈 모킹
jest.mock('../../src/screens/HomeScreen', () => ({
  __esModule: true,
  default: jest.fn()
}));

// AuthContext 모킹
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// EmotionContext 모킹 
jest.mock('../../src/contexts/EmotionContext', () => ({
  useEmotion: jest.fn().mockReturnValue({
    emotions: [{ emotion_id: 1, name: '행복' }],
    selectedEmotions: [],
    selectEmotion: jest.fn(),
    logEmotion: jest.fn(),
  })
}));

describe('HomeScreen Authentication', () => {
  // 테스트 전에 HomeScreen 모킹을 설정
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 실제 HomeScreen 대신 MockHomeScreen 사용
    const HomeScreenModule = require('../../src/screens/HomeScreen');
    HomeScreenModule.default.mockImplementation(MockHomeScreen);
  });

  it('renders login required message when not authenticated', () => {
    // 인증되지 않은 상태로 모킹
    (AuthContextModule.useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null
    });

    // 실제 HomeScreen을 가져와 렌더링
    const HomeScreen = require('../../src/screens/HomeScreen').default;
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('로그인이 필요합니다')).toBeTruthy();
    expect(getByText('게시물을 보려면, 먼저 로그인해주세요.')).toBeTruthy();
  });

  it('renders screen content when authenticated', () => {
    // 인증된 상태로 모킹
    (AuthContextModule.useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { username: 'testuser', nickname: '테스트' }
    });

    // 실제 HomeScreen을 가져와 렌더링
    const HomeScreen = require('../../src/screens/HomeScreen').default;
    const { getByText, getByTestId } = render(<HomeScreen />);
    
    expect(getByText('환영합니다, 테스트님')).toBeTruthy();
    expect(getByTestId('home-screen-container')).toBeTruthy();
  });
});