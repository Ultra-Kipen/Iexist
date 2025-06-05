import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'react-native',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|react-native-vector-icons|react-native-paper|@react-navigation|react-native-reanimated|react-native-gesture-handler)/)',
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@layouts/(.*)$': '<rootDir>/src/layouts/$1',
  },
  setupFiles: [
    './jest.setup.ts'
  ],
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)", 
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  testPathIgnorePatterns: [
    "/node_modules/", 
    "/dist/"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    __DEV__: true
  },
  cacheDirectory: '.jest/cache',
  testTimeout: 5000, // 타임아웃 시간 줄임
  maxWorkers: "50%", // 워커 수 조정
  forceExit: true, // 강제 종료 옵션 추가
  detectOpenHandles: true, // 열린 핸들 감지
};

export default config;