import React from 'react';
import { NativeModules, TextInput as RNTextInput, TouchableOpacity, Text as RNText, View } from 'react-native';
import 'react-native-gesture-handler/jestSetup';
import { configure } from '@testing-library/react-native';

// Reanimated 모킹
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// 기본 애니메이션 모듈 모킹 대체
jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  reactNative.NativeModules.NativeAnimatedHelper = {
    startAnimatingNode: jest.fn(),
    stopAnimation: jest.fn(),
  };
  return reactNative;
});

// AsyncStorage 모킹
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// SafeAreaContext 모킹
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: function SafeAreaProvider({ children }: { children: React.ReactNode }) { 
    return children; 
  },
  SafeAreaView: function SafeAreaView({ children }: { children: React.ReactNode }) { 
    return children; 
  },
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Navigation 모킹
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// React Native Vector Icons 모킹
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => ({
  __esModule: true,
  default: 'MockedMaterialCommunityIcons',
}));

// React Native Paper 모킹 개선
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, TextInput, TouchableOpacity, Text } = require('react-native');

  return {
    TextInput: jest.fn(function MockTextInput(props) {
      const { label, testID, ...rest } = props;
      return React.createElement(TextInput, {
        ...rest,
        placeholder: label,
        testID: testID || `input-${label}`
      });
    }),
    Button: jest.fn(function MockButton(props) {
      const { children, onPress, testID, ...rest } = props;
      return React.createElement(
        TouchableOpacity, 
        {
          ...rest,
          onPress: onPress,
          testID: testID || `button-${typeof children === 'string' ? children : 'custom'}`
        }, 
        typeof children === 'string' ? React.createElement(Text, null, children) : children
      );
    }),
    Text: jest.fn(function MockText(props) {
      const { children, ...rest } = props;
      return React.createElement(Text, rest, children);
    }),
    Chip: jest.fn(function Chip(props) {
      const { children, icon, onPress, selected, style, testID, textStyle } = props;
      return React.createElement(
        TouchableOpacity, 
        { onPress, style: [{ borderRadius: 20, padding: 8, margin: 4 }, style], testID },
        [
          icon && React.createElement(View, { key: 'icon' }, icon()),
          React.createElement(Text, { key: 'text', style: textStyle }, children)
        ]
      );
    }),
    ActivityIndicator: jest.fn(() => React.createElement(View, null, null)),
    Provider: function Provider(props: { children: any; }) {
      return props.children;
    }
  };
});

// 플랫폼 관련 모킹
NativeModules.RNCNetInfo = {
  getCurrentState: jest.fn(() => Promise.resolve()),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

// React 상태 업데이트 배치 처리 설정
configure({
  asyncUtilTimeout: 10000, // 기본 타임아웃 증가
});

// 콘솔 오류 메시지 필터링 - act 경고와 특정 오류 억제
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('act(') || 
     args[0].includes('inside a test was not wrapped in act') ||
     args[0].includes('unmounted component') ||
     args[0].includes('감정 로드 오류'))
  ) {
    return; // act 및 unmounted component 관련 경고와 감정 로드 오류 무시
  }
  originalConsoleError(...args);
};