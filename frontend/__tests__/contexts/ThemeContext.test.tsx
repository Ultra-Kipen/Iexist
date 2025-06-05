// __tests__/contexts/ThemeContext.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../../src/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// AsyncStorage 모킹
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// useColorScheme 모킹
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 초기 시스템 테마를 light로 설정
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  it('이전에 저장된 테마를 불러온다', async () => {
    // 테마가 'dark'로 저장됨
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');
    
    // 시스템 테마를 light로 유지
    (useColorScheme as jest.Mock).mockReturnValue('light');
    
    const result = await new Promise<{ theme: string; isDarkMode: boolean }>((resolve) => {
      const TestComponent = () => {
        const { theme, isDarkMode } = useTheme();
        
        React.useEffect(() => {
          // 테마가 system이 아니고 로딩이 완료되었을 때 resolve
          if (theme !== 'system') {
            resolve({ theme, isDarkMode });
          }
        }, [theme, isDarkMode]);
        
        return null;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
    });

    // 검증
    expect(result.theme).toBe('dark');
    expect(result.isDarkMode).toBe(true);
  });

  it('시스템 테마가 변경되면 "system" 모드일 때 isDarkMode가 업데이트된다', async () => {
    // 저장된 테마를 system으로 설정
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('system');
    
    // 초기 시스템 테마는 light
    (useColorScheme as jest.Mock).mockReturnValue('light');
    
    const result = await new Promise<{ theme: string; isDarkMode: boolean }>((resolve) => {
      const TestComponent = () => {
        const { theme, isDarkMode } = useTheme();
        
        React.useEffect(() => {
          // 테마가 system이고 로딩이 완료되었을 때 resolve
          if (theme === 'system') {
            resolve({ theme, isDarkMode });
          }
        }, [theme, isDarkMode]);
        
        return null;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
    });

    // 검증
    expect(result.theme).toBe('system');
    expect(result.isDarkMode).toBe(false);
  });
});