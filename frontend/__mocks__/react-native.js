// __mocks__/react-native.js
'use strict';

// 실제 react-native를 가져오려고 시도하지 않고, 모든 것을 모킹합니다
const DevMenuMock = {
  show: jest.fn(),
  debugRemotely: jest.fn(),
};

module.exports = {
  // 기본 컴포넌트
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Image: 'Image',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  
  // TurboModuleRegistry 모킹
  TurboModuleRegistry: {
    get: jest.fn(() => null),
    getEnforcing: jest.fn((name) => {
      if (name === 'DevMenu') {
        return DevMenuMock;
      }
      return null;
    })
  },
  
  // DevMenu 모킹
  DevMenu: DevMenuMock,
  
  // StyleSheet 모킹
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    hairlineWidth: 1,
  },
  
  // Platform 모킹
  Platform: {
    OS: 'android',
    select: jest.fn((obj) => obj.android || obj.default),
    Version: {
      SDK_INT: 28
    }
  },
  
  // Dimensions 모킹
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  // Alert 모킹
  Alert: {
    alert: jest.fn(),
  },
  
  // 네이티브 모듈 모킹
  NativeModules: {
    DevMenu: DevMenuMock,
    NativeAnimatedHelper: {
      startAnimatingNode: jest.fn(),
      stopAnimation: jest.fn(),
    },
    RNCNetInfo: {
      getCurrentState: jest.fn(() => Promise.resolve()),
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    },
    StatusBarManager: {
      HEIGHT: 42,
      setStyle: jest.fn(),
      setHidden: jest.fn(),
    }
  },
  
  // Animated 모킹
  Animated: {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({
        interpolate: jest.fn(),
      })),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
    })),
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    createAnimatedComponent: jest.fn(comp => comp),
  },
  
  // 그 외 자주 사용되는 API
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  
  LayoutAnimation: {
    configureNext: jest.fn(),
    create: jest.fn(),
    Types: {},
    Properties: {},
  },
  
  UIManager: {
    measure: jest.fn(),
    measureInWindow: jest.fn(),
  },
  
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  })),
  
  useWindowDimensions: jest.fn(() => ({ width: 375, height: 667 })),
  
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn(size => size * 2),
    roundToNearestPixel: jest.fn(size => size),
  },
  
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    currentState: 'active',
  },
  
  // 더 많은 API 모킹이 필요하면 여기에 추가할 수 있습니다
};