import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme는 ThemeProvider 내에서 사용해야 합니다');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'app_theme_preference';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme() as 'light' | 'dark';
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === 'dark');
  const [isThemeLoaded, setIsThemeLoaded] = useState<boolean>(false);

  // 저장된 테마 설정 불러오기
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const validTheme = savedTheme && ['light', 'dark', 'system'].includes(savedTheme) 
          ? savedTheme as ThemeType 
          : 'system';
        
        setThemeState(validTheme);
        
        // 직접 테마에 따라 isDarkMode 설정
        if (validTheme === 'dark') {
          setIsDarkMode(true);
        } else if (validTheme === 'light') {
          setIsDarkMode(false);
        } else {
          // system 모드일 때는 시스템 색상 스키마에 따라 설정
          setIsDarkMode(systemColorScheme === 'dark');
        }
        
        setIsThemeLoaded(true);
      } catch (error) {
        console.error('테마 설정을 불러오는데 실패했습니다:', error);
        setThemeState('system');
        setIsDarkMode(systemColorScheme === 'dark');
        setIsThemeLoaded(true);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  // 테마 설정 변경
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    
    // 테마에 따라 isDarkMode 직접 설정
    if (newTheme === 'dark') {
      setIsDarkMode(true);
    } else if (newTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // system 모드일 때는 시스템 색상 스키마에 따라 설정
      setIsDarkMode(systemColorScheme === 'dark');
    }
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('테마 설정 저장에 실패했습니다:', error);
    }
  };

  // 라이트/다크 모드 토글
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // isThemeLoaded가 false일 때는 null을 반환하거나 로딩 상태를 표시할 수 있음
  if (!isThemeLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};