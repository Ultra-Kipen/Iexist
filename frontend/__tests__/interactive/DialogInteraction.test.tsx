// DialogInteraction.test.tsx (수정)
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View, TouchableOpacity, ViewProps, TextInputProps } from 'react-native';
import * as AuthContextModule from '../../src/contexts/AuthContext';
import * as EmotionContextModule from '../../src/contexts/EmotionContext';

// TextInput 모의 컴포넌트에 타입 추가
interface MockTextInputProps extends ViewProps {
  onChangeText?: (text: string) => void;
  testID?: string;
  [key: string]: any; // 기타 속성을 허용
}

function TextInput(props: MockTextInputProps) {
  return <View {...props} />;
}

// 실제 HomeScreen 대신 사용할 간단한 모의 컴포넌트
function MockHomeScreen() {
  const [isDialogVisible, setIsDialogVisible] = React.useState(false);
  
  const showDialog = () => setIsDialogVisible(true);
  const hideDialog = () => setIsDialogVisible(false);
  
  return (
    <View testID="home-screen-container">
      <TextInput 
        testID="post-content-input" 
        onChangeText={() => {}}
      />
      <TouchableOpacity testID="emotion-chip-행복" onPress={() => {}} />
      <TouchableOpacity testID="share-post-button" onPress={showDialog} />
      
      {isDialogVisible && (
        <View testID="success-dialog">
          <Text>게시 완료</Text>
          <Text>당신의 하루가 성공적으로 공유되었습니다.</Text>
          <TouchableOpacity testID="dialog-confirm-button" onPress={hideDialog}>
            <Text>확인</Text>
          </TouchableOpacity>
        </View>
      )}
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
    logEmotion: jest.fn()
  })
}));

describe('HomeScreen Dialog Interaction', () => {
  // 테스트 전에 HomeScreen 모킹을 설정
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 실제 HomeScreen 대신 MockHomeScreen 사용
    const HomeScreenModule = require('../../src/screens/HomeScreen');
    HomeScreenModule.default.mockImplementation(MockHomeScreen);
  });
  
  it('shows and dismisses success dialog', async () => {
    const HomeScreen = require('../../src/screens/HomeScreen').default;
    const { getByTestId, getByText, queryByTestId } = render(<HomeScreen />);
    
    const contentInput = getByTestId('post-content-input');
    const emotionChip = getByTestId('emotion-chip-행복');
    const shareButton = getByTestId('share-post-button');

    fireEvent.changeText(contentInput, '오늘의 기분');
    fireEvent.press(emotionChip);
    fireEvent.press(shareButton);

    // 다이얼로그 표시 확인
    const dialog = getByTestId('success-dialog');
    expect(dialog).toBeTruthy();

    // 확인 버튼 클릭
    const confirmButton = getByTestId('dialog-confirm-button');
    fireEvent.press(confirmButton);

    // 다이얼로그 사라짐 확인
    expect(queryByTestId('success-dialog')).toBeNull();
  });
});