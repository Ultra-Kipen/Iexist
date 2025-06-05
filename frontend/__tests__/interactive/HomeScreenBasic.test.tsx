// HomeScreenBasic.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';

// 자동 모킹 활성화 (최소한의 모킹)
jest.mock('react-native-paper', () => {
  return {
    Button: 'Button',
    Text: 'Text',
    TextInput: 'TextInput',
    Card: {
      Content: 'Card.Content',
      Actions: 'Card.Actions',
      Title: 'Card.Title'
    },
    Dialog: {
      Title: 'Dialog.Title',
      Content: 'Dialog.Content',
      Actions: 'Dialog.Actions'
    },
    Portal: 'Portal',
    IconButton: 'IconButton',
    Surface: 'Surface',
    FAB: 'FAB',
    Divider: 'Divider',
    Chip: 'Chip',
    Avatar: {
      Icon: 'Avatar.Icon'
    },
    ActivityIndicator: 'ActivityIndicator',
    useTheme: () => ({ colors: { primary: '#6200ee', surface: '#ffffff' } })
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 1, username: 'testuser', nickname: '테스트유저' },
    isAuthenticated: true
  }))
}));

jest.mock('../../src/contexts/EmotionContext', () => ({
  useEmotion: jest.fn(() => ({
    emotions: [{ emotion_id: 1, name: '행복', icon: 'icon-happy', color: '#FFD700' }],
    selectedEmotions: [],
    logEmotion: jest.fn()
  }))
}));

// 실제 테스트 코드
describe('HomeScreen Basic', () => {
  it('can be imported without crashing', () => {
    // 아직 렌더링은 하지 않고 단순히 임포트만 테스트
    const HomeScreen = require('../../src/screens/HomeScreen').default;
    expect(HomeScreen).toBeDefined();
  });
});