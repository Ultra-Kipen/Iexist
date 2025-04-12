// RegisterScreen.test.tsx 수정
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../../src/screens/RegisterScreen';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { Alert } from 'react-native';

// Mock the Alert module
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getAllByText, getByText } = render(
      <AuthProvider>
        <RegisterScreen navigation={mockNavigation} />
      </AuthProvider>
    );

    // 여러개 있는 경우 getAllByText 사용하거나 더 명확한 선택자 활용
    expect(getAllByText('회원가입')[0]).toBeTruthy();
    expect(getByText('IExist와 함께 나의 존재를 기록해보세요')).toBeTruthy();
    expect(getByText('이미 계정이 있으신가요?')).toBeTruthy();
    expect(getByText('로그인')).toBeTruthy();
  });

  it('validates form inputs', async () => {
    const { getAllByText, getByText } = render(
      <AuthProvider>
        <RegisterScreen navigation={mockNavigation} />
      </AuthProvider>
    );

    // 여러개 있는 경우 getAllByText 및 인덱스 사용
    const registerButtons = getAllByText('회원가입');
    // 버튼으로 사용되는 회원가입 텍스트 (일반적으로 마지막 요소)
    const registerButton = registerButtons[registerButtons.length - 1];
    fireEvent.press(registerButton);
    
    await waitFor(() => {
      expect(getByText('사용자 이름을 입력해주세요')).toBeTruthy();
      expect(getByText('이메일을 입력해주세요')).toBeTruthy();
      expect(getByText('비밀번호를 입력해주세요')).toBeTruthy();
      expect(getByText('비밀번호 확인을 입력해주세요')).toBeTruthy();
    });
  });

  it('validates password confirmation', async () => {
    const { getAllByText, getByText, getByTestId } = render(
      <AuthProvider>
        <RegisterScreen navigation={mockNavigation} />
      </AuthProvider>
    );

    // Fill the form with mismatched passwords
    fireEvent.changeText(getByTestId('input-사용자 이름'), 'testuser');
    fireEvent.changeText(getByTestId('input-이메일'), 'test@example.com');
    fireEvent.changeText(getByTestId('input-비밀번호'), 'password123');
    fireEvent.changeText(getByTestId('input-비밀번호 확인'), 'different');
    
    // 여러개 있는 경우 getAllByText 및 인덱스 사용
    const registerButtons = getAllByText('회원가입');
    const registerButton = registerButtons[registerButtons.length - 1];
    fireEvent.press(registerButton);
    
    await waitFor(() => {
      expect(getByText('비밀번호가 일치하지 않습니다')).toBeTruthy();
    });
  });

  it('navigates to login screen', () => {
    const { getByText } = render(
      <AuthProvider>
        <RegisterScreen navigation={mockNavigation} />
      </AuthProvider>
    );

    fireEvent.press(getByText('로그인'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });
});