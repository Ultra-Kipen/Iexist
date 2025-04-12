// __tests__/contexts/AuthContext.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../src/services/api/authService';
import { View, Text, TouchableOpacity } from 'react-native';

// Mock the authService
jest.mock('../../src/services/api/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
}));

// Create a test component that uses the AuthContext
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, register } = useAuth();
  
  return (
    <View>
      <Text testID="user">{user ? JSON.stringify(user) : 'no user'}</Text>
      <Text testID="authenticated">{isAuthenticated ? 'true' : 'false'}</Text>
      <TouchableOpacity 
        testID="login" 
        onPress={() => login({ email: 'test@test.com', password: 'password123' })}
      >
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        testID="logout" 
        onPress={() => logout()}
      >
        <Text>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        testID="register" 
        onPress={() => register({ username: 'testuser', email: 'test@test.com', password: 'password123' })}
      >
        <Text>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // AsyncStorage mock 리셋
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
    
    // 모든 AsyncStorage 함수에 기본값 설정
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('provides authentication state', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 비동기 작업이 완료될 때까지 대기
    await waitFor(() => {
      const authenticatedText = getByTestId('authenticated');
      const userText = getByTestId('user');
      
      expect(authenticatedText.props.children).toBe('false');
      expect(userText.props.children).toBe('no user');
    });
  });

  it('handles login', async () => {
    const mockUser = { user_id: 1, email: 'test@test.com', username: 'testuser' };
    
    (authService.login as jest.Mock).mockResolvedValue({
      data: {
        data: {
          token: 'test-token',
          user: mockUser
        }
      }
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 비동기 작업이 완료될 때까지 대기
    await waitFor(() => getByTestId('login'));
    
    // 로그인 버튼 클릭
    fireEvent.press(getByTestId('login'));

    // 결과 확인
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });
  });

  it('handles logout', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 비동기 작업이 완료될 때까지 대기
    await waitFor(() => getByTestId('logout'));
    
    // 로그아웃 버튼 클릭
    fireEvent.press(getByTestId('logout'));

    // 결과 확인
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  it('handles register', async () => {
    const mockUser = { user_id: 1, email: 'test@test.com', username: 'testuser' };
    
    (authService.register as jest.Mock).mockResolvedValue({
      data: {
        data: {
          token: 'test-token',
          user: mockUser
        }
      }
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // 비동기 작업이 완료될 때까지 대기
    await waitFor(() => getByTestId('register'));
    
    // 회원가입 버튼 클릭
    fireEvent.press(getByTestId('register'));

    // 결과 확인
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });
  });
});