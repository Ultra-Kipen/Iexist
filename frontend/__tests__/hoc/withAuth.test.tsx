import React from 'react';
import { render } from '@testing-library/react-native';
import { withAuth } from '../../src/hoc/withAuth';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../src/store';
import { Text } from 'react-native';

// useNavigation 모킹
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// useStore 모킹
jest.mock('../../src/store', () => ({
  useStore: jest.fn(),
}));

describe('withAuth HOC', () => {
  // 테스트 컴포넌트
  const TestComponent = () => <Text testID="authenticated-component">인증된 컴포넌트</Text>;
  const AuthenticatedComponent = withAuth(TestComponent);
  
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  test('인증된 경우 컴포넌트가 렌더링되어야 함', () => {
    // 인증된 상태로 모킹
    (useStore as jest.Mock).mockReturnValue({
      state: { isAuthenticated: true },
    });

    const { getByTestId } = render(<AuthenticatedComponent />);
    expect(getByTestId('authenticated-component')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('인증되지 않은 경우 로그인 화면으로 네비게이션되어야 함', () => {
    // 인증되지 않은 상태로 모킹
    (useStore as jest.Mock).mockReturnValue({
      state: { isAuthenticated: false },
    });

    const { queryByTestId } = render(<AuthenticatedComponent />);
    
    expect(mockNavigate).toHaveBeenCalledWith('Login');
    expect(queryByTestId('authenticated-component')).toBeNull();
  });

  test('HOC가 displayName을 올바르게 설정해야 함', () => {
    expect(AuthenticatedComponent.displayName).toBe('withAuth(TestComponent)');
  });

  test('isAuthenticated 상태가 변경될 때 컴포넌트가 적절하게 리렌더링되어야 함', () => {
    // 처음에는 인증되지 않은 상태
    (useStore as jest.Mock).mockReturnValue({
      state: { isAuthenticated: false },
    });

    const { queryByTestId, rerender } = render(<AuthenticatedComponent />);
    expect(queryByTestId('authenticated-component')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('Login');

    // 인증된 상태로 변경
    (useStore as jest.Mock).mockReturnValue({
      state: { isAuthenticated: true },
    });

    rerender(<AuthenticatedComponent />);
    expect(queryByTestId('authenticated-component')).toBeTruthy();
  });
});