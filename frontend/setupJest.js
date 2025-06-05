// setupJest.js
// Jest 설정 파일

// API 클라이언트 모킹
jest.mock('./src/services/api/client', () => {
    return {
      default: {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        get: jest.fn().mockResolvedValue({ data: {} }),
        post: jest.fn().mockResolvedValue({ data: { success: true } }),
        put: jest.fn().mockResolvedValue({ data: {} }),
        delete: jest.fn().mockResolvedValue({ data: {} })
      }
    };
  }, { virtual: true });
  
  // AsyncStorage 모킹
  jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue('mock_token'),
    setItem: jest.fn(),
    removeItem: jest.fn()
  }));
  
  // MaterialCommunityIcons 모킹
  jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MockIcon');
  
  // React Native 기본 컴포넌트 모킹
  jest.mock('react-native', () => {
    const reactNative = jest.requireActual('react-native');
    
    return {
      ...reactNative,
      Alert: {
        ...reactNative.Alert,
        alert: jest.fn(),
      },
      Platform: {
        ...reactNative.Platform,
        OS: 'ios',
        select: jest.fn(obj => obj.ios),
      },
      Animated: {
        ...reactNative.Animated,
        Value: jest.fn(() => ({
          interpolate: jest.fn(),
          setValue: jest.fn(),
        })),
      },
      UIManager: {
        ...reactNative.UIManager,
        measureInWindow: jest.fn(),
      },
    };
  });
  
  // 전역 타이머 설정
  jest.useFakeTimers();
  
  // 콘솔 경고 억제 설정
  console.error = jest.fn();
  console.warn = jest.fn();