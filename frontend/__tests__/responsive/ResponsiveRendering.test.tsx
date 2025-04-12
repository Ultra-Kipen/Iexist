// __tests__/responsive/ResponsiveRendering.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { EmotionProvider } from '../../src/contexts/EmotionContext';

// 화면 크기 모킹 함수
const mockScreenSize = (width: number, height: number) => {
  const original = Dimensions.get;
  jest.spyOn(Dimensions, 'get').mockImplementation((dimension) => {
    if (dimension === 'window' || dimension === 'screen') {
      return { width, height, scale: 1, fontScale: 1 };
    }
    return original(dimension);
  });
};

describe('Responsive Rendering Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('renders correctly on small screen', async () => {
    // 작은 화면 사이즈 모킹 (핸드폰)
    mockScreenSize(320, 568);
    
    const { toJSON } = render(
      <AuthProvider>
        <EmotionProvider>
          <HomeScreen />
        </EmotionProvider>
      </AuthProvider>
    );
    
    // 스냅샷 비교
    expect(toJSON()).toMatchSnapshot();
  });
  
  it('renders correctly on medium screen', async () => {
    // 중간 화면 사이즈 모킹 (대형 핸드폰)
    mockScreenSize(375, 812);
    
    const { toJSON } = render(
      <AuthProvider>
        <EmotionProvider>
          <HomeScreen />
        </EmotionProvider>
      </AuthProvider>
    );
    
    // 스냅샷 비교
    expect(toJSON()).toMatchSnapshot();
  });
  
  it('renders correctly on large screen', async () => {
    // 큰 화면 사이즈 모킹 (태블릿)
    mockScreenSize(768, 1024);
    
    const { toJSON } = render(
      <AuthProvider>
        <EmotionProvider>
          <HomeScreen />
        </EmotionProvider>
      </AuthProvider>
    );
    
    // 스냅샷 비교
    expect(toJSON()).toMatchSnapshot();
  });
  
  it('adjusts layout based on orientation', async () => {
    // 가로 모드 모킹
    mockScreenSize(812, 375);
    
    const { toJSON } = render(
      <AuthProvider>
        <EmotionProvider>
          <HomeScreen />
        </EmotionProvider>
      </AuthProvider>
    );
    
    // 스냅샷 비교
    expect(toJSON()).toMatchSnapshot();
  });
});