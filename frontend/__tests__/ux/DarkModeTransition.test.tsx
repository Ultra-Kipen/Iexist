import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Text, View, TouchableOpacity } from 'react-native';

// 다크 모드 컨텍스트를 위한 목 구현
const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// 테마 제공자 컴포넌트
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = React.useState('light');
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 테마를 사용하는 컴포넌트
const ThemedComponent = () => {
  const { theme, toggleTheme } = React.useContext(ThemeContext);
  
  // 인라인 스타일을 객체로 정의
  const containerStyle = {
    backgroundColor: theme === 'light' ? '#ffffff' : '#121212',
    padding: 20,
  };
  
  const textStyle = {
    color: theme === 'light' ? '#000000' : '#ffffff',
  };
  
  const buttonStyle = {
    backgroundColor: theme === 'light' ? '#007bff' : '#0056b3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  };
  
  const buttonTextStyle = {
    color: '#ffffff',
  };
  
  return (
    <View style={containerStyle}>
      <Text style={textStyle} testID="theme-text">현재 테마: {theme}</Text>
      <TouchableOpacity
        style={buttonStyle}
        onPress={toggleTheme}
        accessibilityLabel="테마 전환 버튼"
        testID="theme-toggle-button"
      >
        <Text style={buttonTextStyle}>테마 전환</Text>
      </TouchableOpacity>
    </View>
  );
};

// 테마 전환 애니메이션을 모의하는 컴포넌트
const AnimatedThemeTransition = () => {
  const { theme, toggleTheme } = React.useContext(ThemeContext);
  const [transitioning, setTransitioning] = React.useState(false);
  
  const handleThemeToggle = () => {
    setTransitioning(true);
    // 실제로는 애니메이션 라이브러리를 사용하지만 여기서는 setTimeout으로 모의
    setTimeout(() => {
      toggleTheme();
      setTransitioning(false);
    }, 300);
  };
  
  // 인라인 스타일을 객체로 정의
  const containerStyle = {
    backgroundColor: transitioning 
      ? '#808080' // 전환 중 회색
      : theme === 'light' ? '#ffffff' : '#121212',
    padding: 20,
    opacity: transitioning ? 0.7 : 1, // 전환 중 약간 투명하게
  };
  
  const textStyle = {
    color: theme === 'light' ? '#000000' : '#ffffff',
  };
  
  const buttonStyle = {
    backgroundColor: theme === 'light' ? '#007bff' : '#0056b3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  };
  
  const buttonTextStyle = {
    color: '#ffffff',
  };
  
  return (
    <View style={containerStyle}>
      <Text style={textStyle} testID="transition-text">
        현재 테마: {theme}{transitioning ? ' (전환 중...)' : ''}
      </Text>
      <TouchableOpacity
        style={buttonStyle}
        onPress={handleThemeToggle}
        accessibilityLabel="테마 전환 버튼"
        testID="theme-toggle-button"
      >
        <Text style={buttonTextStyle}>테마 전환</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('다크 모드 전환 테스트', () => {
  test('테마 전환 버튼 클릭 시 테마가 변경되어야 함', () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider>
        <ThemedComponent />
      </ThemeProvider>
    );
    
    // 초기 테마 확인
    expect(getByText('현재 테마: light')).toBeTruthy();
    
    // 테마 전환 버튼 클릭
    const toggleButton = getByTestId('theme-toggle-button');
    fireEvent.press(toggleButton);
    
    // 테마가 dark로 변경되었는지 확인
    expect(getByText('현재 테마: dark')).toBeTruthy();
    
    // 다시 테마 전환 버튼 클릭
    fireEvent.press(toggleButton);
    
    // 테마가 light로 돌아왔는지 확인
    expect(getByText('현재 테마: light')).toBeTruthy();
  });
  
  test('애니메이션 전환 시 중간 상태가 표시되어야 함', async () => {
    jest.useFakeTimers();
    
    const { getByTestId, getByText, queryByText } = render(
      <ThemeProvider>
        <AnimatedThemeTransition />
      </ThemeProvider>
    );
    
    // 초기 테마 확인
    expect(getByText('현재 테마: light')).toBeTruthy();
    
    // 테마 전환 버튼 클릭
    const toggleButton = getByTestId('theme-toggle-button');
    fireEvent.press(toggleButton);
    
    // 중간 상태 확인
    expect(getByText('현재 테마: light (전환 중...)')).toBeTruthy();
    
    // 타이머 진행
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    
    // 이 시점에서 toggleTheme가 호출되었고 transitioning이 false로 설정됐을 것입니다
    expect(queryByText('현재 테마: light (전환 중...)')).toBeNull();
    expect(getByText('현재 테마: dark')).toBeTruthy();
    
    // 타이머 정리
    jest.useRealTimers();
  });
});