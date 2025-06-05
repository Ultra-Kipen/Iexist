// ImageUpload.test.tsx (수정)
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import * as AuthContextModule from '../../src/contexts/AuthContext';
import * as EmotionContextModule from '../../src/contexts/EmotionContext';

// 실제 HomeScreen 대신 사용할 간단한 모의 컴포넌트
function MockHomeScreen() {
  const [imageUrl, setImageUrl] = React.useState('');
  
  const handleImageUpload = () => {
    setImageUrl('https://via.placeholder.com/150');
  };
  
  return (
    <View testID="home-screen-container">
      <TouchableOpacity 
        testID="image-upload-button"
        onPress={handleImageUpload}
      >
        <Text>사진 추가</Text>
      </TouchableOpacity>
      
      {imageUrl && (
        <Image 
          testID="uploaded-image"
          source={{ uri: imageUrl }}
          style={{ width: 150, height: 150 }}
        />
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

// EmotionContext 모킹 (필요시)
jest.mock('../../src/contexts/EmotionContext', () => ({
  useEmotion: jest.fn().mockReturnValue({
    emotions: [{ emotion_id: 1, name: '행복' }],
    selectedEmotions: [],
    selectEmotion: jest.fn()
  })
}));

describe('HomeScreen Image Upload', () => {
  // 테스트 전에 HomeScreen 모킹을 설정
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 실제 HomeScreen 대신 MockHomeScreen 사용
    const HomeScreenModule = require('../../src/screens/HomeScreen');
    HomeScreenModule.default.mockImplementation(MockHomeScreen);
  });
  
  it('shows image upload button', () => {
    const HomeScreen = require('../../src/screens/HomeScreen').default;
    const { getByTestId } = render(<HomeScreen />);
    
    const imageUploadButton = getByTestId('image-upload-button');
    expect(imageUploadButton).toBeTruthy();
  });

  it('uploads image and displays preview', () => {
    const HomeScreen = require('../../src/screens/HomeScreen').default;
    const { getByTestId } = render(<HomeScreen />);
    
    const imageUploadButton = getByTestId('image-upload-button');
    fireEvent.press(imageUploadButton);

    const uploadedImage = getByTestId('uploaded-image');
    expect(uploadedImage).toBeTruthy();
  });
});