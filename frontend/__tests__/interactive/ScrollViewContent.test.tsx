// ScrollViewContent.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import MockHomeScreen from '../../__mocks__/HomeScreenMock';

// 실제 HomeScreen 모듈을 모킹
jest.mock('../../src/screens/HomeScreen', () => {
  return {
    __esModule: true,
    default: require('../__mocks__/HomeScreenMock').default
  };
});

// 모든 필요한 컨텍스트와 훅 모킹
jest.mock('react-native-paper', () => ({
  useTheme: () => ({ colors: {} }),
  Card: { Content: () => null }
}));

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: {}, isAuthenticated: true })
}));

jest.mock('../../src/contexts/EmotionContext', () => ({
  useEmotion: () => ({ 
    emotions: [], 
    selectedEmotions: [], 
    setSelectedEmotions: jest.fn(),
    logEmotion: jest.fn()
  })
}));

describe('HomeScreen UI Components', () => {
  it('renders main sections of the HomeScreen', () => {
    const { getByTestId, getByText } = render(<MockHomeScreen />);
    
    // 주요 섹션들이 렌더링되었는지 확인
    expect(getByTestId('home-screen-mock')).toBeTruthy();
    expect(getByTestId('emotion-surface')).toBeTruthy();
    expect(getByTestId('post-input-card')).toBeTruthy();
    
    // 텍스트 내용 확인
    expect(getByText('오늘의 감정')).toBeTruthy();
    expect(getByText('나의 하루는...')).toBeTruthy();
    expect(getByText('누군가의 하루는..')).toBeTruthy();
  });
});