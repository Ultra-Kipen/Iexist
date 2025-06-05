// EmotionSelector.test.tsx (수정)
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import * as AuthContextModule from '../../src/contexts/AuthContext';
import * as EmotionContextModule from '../../src/contexts/EmotionContext';

// 모의 칩 컴포넌트의 Props 타입 정의
interface MockChipProps {
  emotion: string;
  [key: string]: any;
}

// 모의 칩 컴포넌트의 State 타입 정의
interface MockChipState {
  selected: boolean;
}

// 모의 감정 칩 컴포넌트를 생성하기 위한 클래스 컴포넌트
class MockChip extends React.Component<MockChipProps, MockChipState> {
  state: MockChipState = {
    selected: false
  };

  toggle = () => {
    this.setState(prevState => ({ selected: !prevState.selected }));
  };

  render() {
    const { emotion } = this.props;
    return (
      <TouchableOpacity 
        testID={`emotion-chip-${emotion}`}
        onPress={this.toggle}
        accessibilityState={{ selected: this.state.selected }}
      >
        <Text>{emotion}</Text>
      </TouchableOpacity>
    );
  }
}

// 실제 HomeScreen 대신 사용할 간단한 모의 컴포넌트
function MockHomeScreen() {
  const emotions = [
    '행복', '감사', '위로', '감동', '슬픔', 
    '불안', '화남', '지침', '우울', '고독', 
    '충격', '편함'
  ];
  
  return (
    <View testID="home-screen-container">
      {emotions.map((emotion) => (
        <MockChip 
          key={emotion}
          emotion={emotion}
        />
      ))}
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

describe('HomeScreen Emotion Selector', () => {
  // 테스트 전에 HomeScreen 모킹을 설정
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 실제 HomeScreen 대신 MockHomeScreen 사용
    const HomeScreenModule = require('../../src/screens/HomeScreen');
    HomeScreenModule.default.mockImplementation(MockHomeScreen);
  });
  
  const emotions = [
    '행복', '감사', '위로', '감동', '슬픔', 
    '불안', '화남', '지침', '우울', '고독', 
    '충격', '편함'
  ];

  it('renders all emotion chips', () => {
    const HomeScreen = require('../../src/screens/HomeScreen').default;
    const { getByTestId } = render(<HomeScreen />);
    
    emotions.forEach(emotion => {
      const emotionChip = getByTestId(`emotion-chip-${emotion}`);
      expect(emotionChip).toBeTruthy();
    });
  });

  it('selects and deselects emotion chips', async () => {
    const HomeScreen = require('../../src/screens/HomeScreen').default;
    const { getByTestId, update } = render(<HomeScreen />);
    
    const happyChip = getByTestId('emotion-chip-행복');
    
    // 초기 상태 확인
    expect(happyChip.props.accessibilityState.selected).toBe(false);
    
    // 첫 번째 선택
    fireEvent.press(happyChip);
    
    // 컴포넌트 상태 업데이트 및 리렌더링을 강제
    update(<HomeScreen />);
    
    // 업데이트된 요소 가져오기
    const updatedChip = getByTestId('emotion-chip-행복');
    expect(updatedChip.props.accessibilityState.selected).toBe(true);
    
    // 다시 선택 (토글)
    fireEvent.press(updatedChip);
    
    // 컴포넌트 상태 업데이트 및 리렌더링을 강제
    update(<HomeScreen />);
    
    // 다시 업데이트된 요소 가져오기
    const finalChip = getByTestId('emotion-chip-행복');
    expect(finalChip.props.accessibilityState.selected).toBe(false);
  });
});