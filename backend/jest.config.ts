// jest.config.ts

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@controllers/(.*)$': '<rootDir>/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@routes/(.*)$': '<rootDir>/routes/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@types/(.*)$': '<rootDir>/types/$1'
  },
  testRegex: '(/tests/.*\\.(test|spec))\\.[tj]s$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/dist/'
  ],
  // setupFilesAfterEnv 제거
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],  // 추가
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  roots: [
    '<rootDir>/tests',
    '<rootDir>/src'
  ],
  displayName: {
    name: 'BACKEND',
    color: 'blue'
  }
};

export default config;