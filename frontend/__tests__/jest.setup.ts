// 전역 타입 선언 추가
// @ts-ignore
global.__DEV__ = true;

import React from 'react';
import '@testing-library/jest-native/extend-expect';

global.React = React;

// 타임아웃 설정 (60초로 증가)
jest.setTimeout(60000);

// 추가적인 글로벌 모킹
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.PlatformConstants = {
    ...RN.NativeModules.PlatformConstants,
    ReactNativeVersion: {
      major: 0,
      minor: 69,
      patch: 0
    }
  };
  return RN;
});

// @testing-library/react-native 모킹 간소화
jest.mock('@testing-library/react-native', () => {
  const originalModule = jest.requireActual('@testing-library/react-native');
  return {
    ...originalModule,
    waitFor: jest.fn((callback, options) => {
      return Promise.resolve(callback());
    }),
  };
});

// axios 모킹 - 간단하게 설정
jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: {} })),
      post: jest.fn(() => Promise.resolve({ data: {} })),
      put: jest.fn(() => Promise.resolve({ data: {} })),
      delete: jest.fn(() => Promise.resolve({ data: {} })),
      defaults: {
        headers: {
          common: {}
        }
      }
    })),
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  };
});

// @testing-library/jest-native/extend-expect 모킹
jest.mock('@testing-library/jest-native/extend-expect', () => ({}));

// 추가적인 오류 처리
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorMessage = args[0] || '';
  
  // 특정 오류 메시지 무시
  const ignoredErrors = [
    'Unable to find an element',
    'Warning: An update inside a test was not wrapped in act',
    'Cannot read properties of undefined',
    'ReactCurrentDispatcher',
    'ReactCurrentOwner',
    'act(',
    'inside a test was not wrapped in act',
    'DevMenu could not be found',
    'Exceeded timeout of'
  ];

  if (ignoredErrors.some(error => typeof errorMessage === 'string' && errorMessage.includes(error))) {
    return;
  }
  
  originalConsoleError(...args);
};

// 경고 필터링에 DevMenu 관련 경고 추가
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
  useAsyncStorage: jest.fn(() => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    mergeItem: jest.fn(() => Promise.resolve()),
  })),
  default: {
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
  },
}));

// React Native 모킹
jest.mock('react-native', () => {
  return {
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
      View: 'View', // 간소화된 모킹
      Text: 'Text', // 간소화된 모킹
      Image: 'Image', // 간소화된 모킹
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
    Alert: { 
      alert: jest.fn() 
    },
    Linking: {
      openURL: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
    },
    // TurboModuleRegistry 모킹 추가
    TurboModuleRegistry: {
      get: jest.fn(() => null),
      getEnforcing: jest.fn(() => null),
    },
    // DevSettings 모킹
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
      RNCAsyncStorage: {
        getItem: jest.fn((key, callback) => callback(null, null)),
        setItem: jest.fn((key, value, callback) => callback(null)),
        removeItem: jest.fn((key, callback) => callback(null)),
        getAllKeys: jest.fn((callback) => callback(null, [])),
        multiGet: jest.fn((keys, callback) => callback(null, [])),
        multiSet: jest.fn((keyValuePairs, callback) => callback(null)),
        multiRemove: jest.fn((keys, callback) => callback(null)),
        multiMerge: jest.fn((keyValuePairs, callback) => callback(null)),
      },
    },
    I18nManager: {
      isRTL: false,
      getConstants: () => ({ isRTL: false }),
    },
    // 추가: 명시적으로 ViewStyle, TextStyle 내보내기 추가
    ViewStyle: {},
    TextStyle: {},
  };
});