// jest.setup.ts
import '@testing-library/jest-native/extend-expect';

// 전역 타입 선언 추가
// @ts-ignore
global.__DEV__ = true;

import React from 'react';
global.React = React;

// 글로벌 타임아웃 설정 - 120초로 증가
jest.setTimeout(120000);
// 타입 정의
interface WaitForOptions {
  timeout?: number;
  interval?: number;
}

// React Native 모킹 - 완전 재정의 방식
// jest.setup.ts 수정 부분
// React Native 모킹 - 한 번에 모든 컴포넌트를 정의
jest.mock('react-native', () => {
  return {
    // 기본 컴포넌트
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    TouchableHighlight: 'TouchableHighlight',
    TouchableWithoutFeedback: 'TouchableWithoutFeedback',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    SectionList: 'SectionList',
    Image: 'Image',
    TextInput: 'TextInput',
    Button: 'Button',
    Switch: 'Switch',
    ActivityIndicator: 'ActivityIndicator',
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    ImageBackground: 'ImageBackground',
    
    // 유틸리티
    StyleSheet: {
      create: jest.fn(styles => styles),
      flatten: jest.fn(style => style),
      absoluteFill: {},
      hairlineWidth: 1,
    },
    Platform: { 
      OS: 'android',
      select: jest.fn(obj => obj.android || obj.default),
      Version: 29,
    },
    Dimensions: { 
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Animated: {
      View: 'View',
      Text: 'Text',
      Image: 'Image',
      createAnimatedComponent: jest.fn(component => component),
      timing: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true })),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true })),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({})),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    },
    Alert: { 
      alert: jest.fn() 
    },
    Linking: {
      openURL: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
    },
    Keyboard: {
      dismiss: jest.fn(),
    },
    StatusBar: {
      setBarStyle: jest.fn(),
      setHidden: jest.fn(),
      setBackgroundColor: jest.fn(),
      currentHeight: 44
    },
    
    // 기타 모듈들
    TurboModuleRegistry: {
      get: jest.fn(() => null),
      getEnforcing: jest.fn(() => null),
    },
    DevSettings: {
      reload: jest.fn(),
      addMenuItem: jest.fn(),
      setIsDebuggingRemotely: jest.fn(),
    },
    NativeModules: {
      DevMenu: {
        show: jest.fn(),
        reload: jest.fn(),
        debugRemotely: jest.fn(),
        setProfilingEnabled: jest.fn(),
        setHotLoadingEnabled: jest.fn(),
      },
      DevSettings: {
        reload: jest.fn(),
        setIsDebuggingRemotely: jest.fn(),
      },
      StatusBarManager: {
        HEIGHT: 42,
        setStyle: jest.fn(),
        setHidden: jest.fn(),
        getHeight: jest.fn(cb => cb && cb(42)),
      },
      PlatformConstants: {
        interfaceIdiom: 'phone',
        osVersion: '10',
        forceTouchAvailable: false,
        reactNativeVersion: {
          major: 0,
          minor: 69,
          patch: 0
        }
      },
    },
    I18nManager: {
      isRTL: false,
      getConstants: () => ({ isRTL: false }),
    },
    ViewStyle: {},
    TextStyle: {},
  };
});

// react-native-safe-area-context 모킹
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: 'SafeAreaProvider',
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })),
}));

// LoadingIndicator 모킹 - 경로를 정확히 지정하지 않고 모듈 이름으로 모킹
jest.mock('@components/LoadingIndicator', () => 'LoadingIndicator', { virtual: true });
// KeyboardAvoidingView 추가 (jest.setup.ts 파일에 이미 있는 React Native 모킹에 추가)


// 컴포넌트 모킹 추가
jest.mock('@components/LoadingIndicator', () => 'LoadingIndicator');
// @testing-library 모듈에서 waitFor 함수만 래핑
// 수정 후 코드
jest.mock('@testing-library/react-native', () => {
  const rtl = jest.requireActual('@testing-library/react-native');
  return rtl;
});

// 타임아웃 설정 줄이기
jest.setTimeout(5000);

// @testing-library/jest-native/extend-expect 모킹
jest.mock('@testing-library/jest-native/extend-expect', () => ({}));

// axios 모킹
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    defaults: { headers: { common: {} } }
  })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

// AsyncStorage 모킹
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  multiMerge: jest.fn(() => Promise.resolve()),
  mergeItem: jest.fn(() => Promise.resolve()),
}));

// 오류 필터링
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorMessage = args[0] || '';
  
  const ignoredErrors = [
    'Unable to find an element',
    'Warning: An update inside a test was not wrapped in act',
    'Cannot read properties of undefined',
    'ReactCurrentDispatcher',
    'ReactCurrentOwner',
    'act(',
    'inside a test was not wrapped in act',
    'DevMenu could not be found',
    'Exceeded timeout',
    'TurboModuleRegistry'
  ];

  if (ignoredErrors.some(error => typeof errorMessage === 'string' && errorMessage.includes(error))) {
    return;
  }
  
  originalConsoleError(...args);
};

// 경고 필터링
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const warningMessage = args[0] || '';
  
  const ignoredWarnings = [
    'ProgressBarAndroid has been extracted',
    'Clipboard has been extracted',
    'TurboModuleRegistry.getEnforcing',
    'DevMenu could not be found',
    'DevSettings',
    'NativeModule: AsyncStorage is null',
  ];
  
  if (ignoredWarnings.some(warning => 
    typeof warningMessage === 'string' && warningMessage.includes(warning)
  )) {
    return;
  }
  
  originalConsoleWarn(...args);
};
// React Navigation 모킹 추가
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    NavigationContainer: 'NavigationContainer',
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: { postId: 1 }
    }),
  };
});

// React Native Paper 모킹 추가
jest.mock('react-native-paper', () => {
  return {
    Provider: 'PaperProvider',
    Button: 'Button',
    Card: 'Card',
    Title: 'Title',
    Paragraph: 'Paragraph',
    TextInput: 'TextInput',
    // 추가 컴포넌트들...
  };
});