import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Button } from 'react-native';
import { expect, describe, it, beforeEach, jest } from '@jest/globals';
import ApiTestScreen from '../../src/screens/ApiTestScreen';
import { AuthContext, AuthContextType } from '../../src/contexts/AuthContext';
import apiClient from '../../src/services/api/client';
import { User } from '../../src/services/api/types';

// API 클라이언트 모킹
jest.mock('../../src/services/api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('ApiTestScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when user is authenticated', () => {
    const mockUser: User = { 
      user_id: 1,
      username: 'testuser', 
      email: 'test@example.com' 
    };
    
    const authContextValue: AuthContextType = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn() as any,
      register: jest.fn() as any,
      logout: jest.fn() as any,
      updateUser: jest.fn() as any
    };

    const { getByText } = render(
      <AuthContext.Provider value={authContextValue}>
        <ApiTestScreen />
      </AuthContext.Provider>
    );

    expect(getByText('API Test Screen')).toBeTruthy();
    expect(getByText('인증 상태: 로그인됨')).toBeTruthy();
    expect(getByText('사용자: testuser')).toBeTruthy();
  });

  it('renders correctly when user is not authenticated', () => {
    const authContextValue: AuthContextType = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn() as any,
      register: jest.fn() as any,
      logout: jest.fn() as any,
      updateUser: jest.fn() as any
    };

    const { getByText, queryByText } = render(
      <AuthContext.Provider value={authContextValue}>
        <ApiTestScreen />
      </AuthContext.Provider>
    );

    expect(getByText('API Test Screen')).toBeTruthy();
    expect(getByText('인증 상태: 로그아웃')).toBeTruthy();
    expect(queryByText(/사용자:/)).toBeNull();
  });

  it('calls API and displays results when a test button is pressed', async () => {
    const mockUser: User = { 
      user_id: 1,
      username: 'testuser', 
      email: 'test@example.com' 
    };
    
    const authContextValue: AuthContextType = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn() as any,
      register: jest.fn() as any,
      logout: jest.fn() as any,
      updateUser: jest.fn() as any
    };
    
    const mockApiResponse: any = { 
      data: { 
        message: 'Success!' 
      } 
    };
      
    (apiClient.get as jest.MockedFunction<typeof apiClient.get>).mockResolvedValueOnce(mockApiResponse);

    // React Native의 Button 컴포넌트에 직접 접근하는 방식 수정
    const { UNSAFE_getAllByType, findByText } = render(
      <AuthContext.Provider value={authContextValue}>
        <ApiTestScreen />
      </AuthContext.Provider>
    );
    // React Native의 Button 컴포넌트를 직접 가져오기
    const buttons = UNSAFE_getAllByType(Button);
    fireEvent.press(buttons[0]);
    fireEvent.press(buttons[0]);

    // 결과가 표시되는지 확인
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/api/users/profile');
    }, { timeout: 10000 });
    
    const resultText = await findByText(/"message": "Success!"/, {}, { timeout: 10000 });
    expect(resultText).toBeTruthy();
  }, 15000);
});