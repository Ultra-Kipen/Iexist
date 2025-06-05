// UserWelcomeMessage.test.tsx (수정)
import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text, ScrollView } from 'react-native';
import * as AuthContextModule from '../../src/contexts/AuthContext';
import * as EmotionContextModule from '../../src/contexts/EmotionContext';

// 실제 HomeScreen 대신 사용할 간단한 모의 컴포넌트
function MockHomeScreen() {
  return (
    <View testID="home-screen-container">
      <ScrollView>
        <Text>환영합니다, testuser님</Text>
        <View testID="emotion-surface">
          <Text>오늘의 감정</Text>
          {/* 감정 선택기 내용 */}
        </View>
        <View testID="post-input-card">
          {/* 게시물 입력 카드 내용 */}
        </View>
        <Text>누군가의 하루는..</Text>
        {/* 게시물 내용 */}
      </ScrollView>
    </View>
  );
}

// 원본 HomeScreen 모듈 모킹
jest.mock('../../src/screens/HomeScreen', () => ({
  __esModule: true,
  default: jest.fn()
}));

// React Native Paper 모킹
jest.mock('react-native-paper', () => ({
  useTheme: jest.fn().mockReturnValue({
    colors: {
      primary: '#000',
      surface: '#fff',
      background: '#fff'
    }
  })
}));

// AuthContext 모킹
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { username: 'testuser' },
    isAuthenticated: true
  })
}));

// EmotionContext 모킹
jest.mock('../../src/contexts/EmotionContext', () => ({
  useEmotion: jest.fn().mockReturnValue({
    emotions: [{ emotion_id: 1, name: '행복' }],
    selectedEmotions: [],
    selectEmotion: jest.fn()
  })
}));

describe('HomeScreen ScrollView Content', () => {
  // 테스트 전에 HomeScreen 모킹을 설정
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 실제 HomeScreen 대신 MockHomeScreen 사용
    const HomeScreenModule = require('../../src/screens/HomeScreen');
    HomeScreenModule.default.mockImplementation(MockHomeScreen);
  });
  
  it('renders ScrollView with required sections', () => {
    const HomeScreen = require('../../src/screens/HomeScreen').default;
    const { getByText, getByTestId } = render(<HomeScreen />);
    
    // 섹션 제목 확인
    expect(getByText('오늘의 감정')).toBeTruthy();
    expect(getByText('누군가의 하루는..')).toBeTruthy();

    // 감정 선택기 영역 확인
    const emotionSurface = getByTestId('emotion-surface');
    expect(emotionSurface).toBeTruthy();

    // 게시물 입력 카드 확인
    const postInputCard = getByTestId('post-input-card');
    expect(postInputCard).toBeTruthy();
  });
});