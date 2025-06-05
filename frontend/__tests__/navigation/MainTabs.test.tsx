// __tests__/navigation/MainTabs.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import MainTabs from '../../src/navigation/MainTabs';

// 모킹
jest.mock('../../src/navigation/HomeStack', () => 'MockedHomeStack');
jest.mock('../../src/screens/ComfortScreen', () => 'MockedComfortScreen');
jest.mock('../../src/screens/ChallengeScreen', () => 'MockedChallengeScreen');
jest.mock('../../src/screens/ReviewScreen', () => 'MockedReviewScreen');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => ({
  __esModule: true,
  default: 'MockedIcon',
}));

// 네비게이션 훅 모킹
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

// 타입 정의
interface NavigatorProps {
  screenOptions?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

interface ScreenProps {
  name: string;
  component: any;
  options: any;
  [key: string]: any;
}

// 탭 네비게이터 모킹
const mockScreen = jest.fn();
const mockNavigator = jest.fn((props: NavigatorProps) => props.children);

jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: () => ({
      Navigator: (props: NavigatorProps) => {
        mockNavigator(props);
        return <>{props.children}</>;
      },
      Screen: (props: ScreenProps) => {
        mockScreen(props);
        return null;
      },
    }),
  };
});

describe('MainTabs', () => {
  beforeEach(() => {
    mockScreen.mockClear();
    mockNavigator.mockClear();
  });

  it('컴포넌트가 오류 없이 렌더링됨', () => {
    expect(() => render(<MainTabs />)).not.toThrow();
  });

  it('네비게이터가 올바른 옵션으로 구성됨', () => {
    render(<MainTabs />);
    expect(mockNavigator).toHaveBeenCalledWith(
      expect.objectContaining({
        screenOptions: expect.objectContaining({
          tabBarActiveTintColor: '#4a0e4e',
          tabBarInactiveTintColor: '#999',
        }),
      })
    );
  });

  it('홈 탭이 올바르게 구성됨', () => {
    render(<MainTabs />);
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Home',
        component: 'MockedHomeStack',
        options: expect.objectContaining({
          headerShown: false,
          tabBarLabel: '나의 하루',
        }),
      })
    );
  });

  it('위로와 공감 탭이 올바르게 구성됨', () => {
    render(<MainTabs />);
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Comfort',
        component: 'MockedComfortScreen',
        options: expect.objectContaining({
          tabBarLabel: '위로와 공감',
        }),
      })
    );
  });

  it('감정 챌린지 탭이 올바르게 구성됨', () => {
    render(<MainTabs />);
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Challenge',
        component: 'MockedChallengeScreen',
        options: expect.objectContaining({
          tabBarLabel: '감정 챌린지',
        }),
      })
    );
  });

  it('일상 돌아보기 탭이 올바르게 구성됨', () => {
    render(<MainTabs />);
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Review',
        component: 'MockedReviewScreen',
        options: expect.objectContaining({
          tabBarLabel: '일상 돌아보기',
        }),
      })
    );
  });

  it('모든 탭이 아이콘을 가짐', () => {
    render(<MainTabs />);
    
    // 각 탭 스크린 호출에서 options.tabBarIcon이 함수인지 확인
    const calls = mockScreen.mock.calls;
    calls.forEach(call => {
      const options = call[0].options;
      expect(typeof options.tabBarIcon).toBe('function');
      
      // 아이콘 함수 호출 테스트
      const iconFn = options.tabBarIcon;
      const result = iconFn({ color: 'red', size: 24 });
      expect(result).toBeDefined();
    });
  });
});