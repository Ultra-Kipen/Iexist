import 'react-native-gesture-handler/jestSetup';
import { jest } from '@jest/globals';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // @ts-expect-error - mock implementation
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('react-native-paper', () => {
  const ActualPaper = jest.requireActual('react-native-paper');
  return {
    ...ActualPaper,
    useTheme: () => ({
      colors: {
        primary: '#4a0e4e',
        background: '#f0e6ff',
        text: '#000000',
        surface: '#ffffff',
      },
    }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

global.__reanimatedWorkletInit = jest.fn();

// 콘솔 경고 필터링
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  if (args[0]?.includes?.('Please update the following components:')) return;
  originalConsoleError.call(console, ...args);
};

console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('Please update the following components:')) return;
  originalConsoleWarn.call(console, ...args);
};

jest.setTimeout(10000);