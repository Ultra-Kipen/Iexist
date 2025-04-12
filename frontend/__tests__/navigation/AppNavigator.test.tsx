// __tests__/navigation/AppNavigator.test.tsx
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../../src/navigation/AppNavigator';

// 모킹할 useAuth 훅의 목 구현
const mockUseAuthReturn = {
  isAuthenticated: false,
  isLoading: false,
};

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuthReturn,
}));

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AuthStack when not authenticated', () => {
    // 인증되지 않은 상태 설정
    mockUseAuthReturn.isAuthenticated = false;
    mockUseAuthReturn.isLoading = false;

    const testRenderer = TestRenderer.create(<AppNavigator />);

    expect(testRenderer).toBeDefined();
    
    const tree = testRenderer.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders MainTabs when authenticated', () => {
    // 인증된 상태 설정
    mockUseAuthReturn.isAuthenticated = true;
    mockUseAuthReturn.isLoading = false;

    const testRenderer = TestRenderer.create(<AppNavigator />);

    expect(testRenderer).toBeDefined();
    
    const tree = testRenderer.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('does not render anything when loading', () => {
    // 로딩 상태 설정
    mockUseAuthReturn.isAuthenticated = false;
    mockUseAuthReturn.isLoading = true;

    const testRenderer = TestRenderer.create(<AppNavigator />);

    // 실제 반환값 확인 (null이 기대됨)
    expect(testRenderer.toJSON()).toBeNull();
  });
});