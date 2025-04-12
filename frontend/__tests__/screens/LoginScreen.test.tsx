// LoginScreen.test.tsx 수정
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import LoginScreen from '../../src/screens/LoginScreen';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { Alert } from 'react-native';
import * as AuthContext from '../../src/contexts/AuthContext';

// Mock the Alert module
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock the useAuth hook
jest.mock('../../src/contexts/AuthContext', () => ({
  ...jest.requireActual('../../src/contexts/AuthContext'),
  useAuth: jest.fn(),
}));

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (AuthContext.useAuth as jest.Mock).mockImplementation(() => ({
      login: mockLogin,
    }));
  });

  it('renders correctly', () => {
    const { getByText, getByLabelText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    
    expect(getByText('IExist')).toBeTruthy();
    expect(getByText('나는 존재한다.')).toBeTruthy();
    expect(getByText('로그인')).toBeTruthy();
    expect(getByText('비밀번호를 잊으셨나요?')).toBeTruthy();
    expect(getByText('회원가입')).toBeTruthy();
  });

  it('validates empty form inputs', async () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
  
    await act(async () => {
      fireEvent.press(getByText('로그인'));
    });
    
    await waitFor(() => {
      expect(getByText('이메일을 입력해주세요')).toBeTruthy();
      expect(getByText('비밀번호를 입력해주세요')).toBeTruthy();
    });
  });
  
  it('validates invalid email format', async () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    
    const emailInput = getByPlaceholderText('이메일');
    fireEvent.changeText(emailInput, 'invalid-email');
    
    await act(async () => {
      fireEvent.press(getByText('로그인'));
    });
    
    await waitFor(() => {
      expect(getByText('유효한 이메일 주소를 입력해주세요')).toBeTruthy();
    });
  });
  
  it('validates short password', async () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    
    const emailInput = getByPlaceholderText('이메일');
    fireEvent.changeText(emailInput, 'valid@email.com');
    
    const passwordInput = getByPlaceholderText('비밀번호');
    fireEvent.changeText(passwordInput, '12345');
    
    await act(async () => {
      fireEvent.press(getByText('로그인'));
    });
    
    await waitFor(() => {
      expect(getByText('비밀번호는 최소 6자 이상이어야 합니다')).toBeTruthy();
    });
  });
  
  it('submits valid form and calls login', async () => {
    mockLogin.mockResolvedValueOnce({});
    
    const { getByText, getByPlaceholderText, queryByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    
    const emailInput = getByPlaceholderText('이메일');
    fireEvent.changeText(emailInput, 'valid@email.com');
    
    const passwordInput = getByPlaceholderText('비밀번호');
    fireEvent.changeText(passwordInput, 'password123');
    
    await act(async () => {
      fireEvent.press(getByText('로그인'));
    });
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ 
        email: 'valid@email.com', 
        password: 'password123' 
      });
    });
  });
  
  it('shows error alert when login fails', async () => {
    const errorMessage = '인증에 실패했습니다';
    mockLogin.mockRejectedValueOnce({ 
      response: { data: { message: errorMessage } } 
    });
    
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    
    const emailInput = getByPlaceholderText('이메일');
    fireEvent.changeText(emailInput, 'valid@email.com');
    
    const passwordInput = getByPlaceholderText('비밀번호');
    fireEvent.changeText(passwordInput, 'password123');
    
    await act(async () => {
      fireEvent.press(getByText('로그인'));
    });
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '로그인 실패',
        errorMessage
      );
    });
  });
  
  it('navigates to registration screen', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
  
    fireEvent.press(getByText('회원가입'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });
  
  it('navigates to forgot password screen', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
  
    fireEvent.press(getByText('비밀번호를 잊으셨나요?'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
  });
});