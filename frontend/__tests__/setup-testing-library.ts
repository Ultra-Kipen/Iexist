// __tests__/setup-testing-library.ts
// @ts-nocheck

// 전역 변수 설정
global.__DEV__ = true;
global.window = global.window || {};
global.window.PR_SHOULD_USE_CONTINUATION = true;

// 타이머 모킹
jest.useFakeTimers();

// React Native 모킹 - 간단하게 유지
jest.mock('react-native', () => {
  return {
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    Image: 'Image',
    ScrollView: 'ScrollView',
    TextInput: 'TextInput',
    StyleSheet: { 
      create: jest.fn(styles => styles),
      flatten: jest.fn(style => style)
    },
    Platform: { 
      OS: 'android',
      select: jest.fn(obj => obj.android || obj.default)
    },
    Dimensions: { 
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    Alert: { 
      alert: jest.fn() 
    },
    TurboModuleRegistry: {
      get: jest.fn(() => null),
      getEnforcing: jest.fn(name => {
        if (name === 'DevMenu') {
          return {
            show: jest.fn(),
            debugRemotely: jest.fn()
          };
        }
        return null;
      })
    },
    DevMenu: {
      show: jest.fn(),
      debugRemotely: jest.fn()
    },
    NativeModules: {
      DevMenu: {
        show: jest.fn(),
        debugRemotely: jest.fn()
      },
      NativeAnimatedHelper: {
        startAnimatingNode: jest.fn(),
        stopAnimation: jest.fn()
      }
    },
    Animated: {
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn()
      })),
      View: 'Animated.View',
      Text: 'Animated.Text',
      Image: 'Animated.Image',
      timing: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true }))
      })),
      spring: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true }))
      }))
    }
  };
}, { virtual: true });

// ReactTestInstance 확장 (있는 경우에만)
try {
  if (typeof global.ReactTestInstance !== 'undefined') {
    Object.defineProperty(global.ReactTestInstance.prototype, 'textContent', {
      get: function() {
        return String(this.toString());
      }
    });
  }
} catch (error) {
  console.warn('ReactTestInstance 확장 실패:', error);
}

// @testing-library/jest-native/extend-expect는 제거하고 
// 직접 사용 시 문제를 해결합니다