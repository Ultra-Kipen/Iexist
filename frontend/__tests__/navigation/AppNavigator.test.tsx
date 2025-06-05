// __tests__/navigation/AppNavigator.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import AppNavigator from '../../src/navigation/AppNavigator';

// 컴포넌트 모킹
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// 네비게이션 관련 모킹
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// 스택 네비게이터 모킹
const mockScreen = jest.fn().mockImplementation(({ name }) => <div>{name}</div>);

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: (props: any) => mockScreen(props)
  })
}));

// 스택 컴포넌트 모킹
jest.mock('../../src/navigation/AuthStack', () => 'MockedAuthStack');
jest.mock('../../src/navigation/MainTabs', () => 'MockedMainTabs');

describe('AppNavigator', () => {
  beforeEach(() => {
    mockScreen.mockClear();
  });

  it('인증되지 않은 상태일 때 AuthStack 스크린이 포함되어야 함', () => {
    // 인증되지 않은 상태 설정
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    
    render(<AppNavigator />);
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'AuthStack'
      })
    );
  });
  
  it('인증된 상태일 때 MainTabs 스크린이 포함되어야 함', () => {
    // 인증된 상태 설정
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    
    render(<AppNavigator />);
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'MainTabs'
      })
    );
  });
  
  it('로딩 중일 때 null을 반환해야 함', () => {
    // 로딩 상태 설정
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });
    
    const { toJSON } = render(<AppNavigator />);
    expect(toJSON()).toBeNull();
  });
});