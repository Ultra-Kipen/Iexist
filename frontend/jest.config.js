const path = require('path');

module.exports = {
  preset: 'react-native',
  rootDir: path.resolve(__dirname, '..'),
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-paper|react-native-vector-icons)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: [
    './node_modules/react-native-gesture-handler/jestSetup.js',
    '<rootDir>/jest.setup.js'
  ],
  testMatch: [
    '<rootDir>/frontend/__tests__/**/*.test.[jt]s?(x)',
    '<rootDir>/frontend/**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};