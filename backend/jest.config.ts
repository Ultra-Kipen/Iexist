// root/backend/jest.config.ts
import type { Config } from '@jest/types';
import { resolve } from 'path';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@config/(.*)$': resolve(__dirname, './config/$1'),
    '^@controllers/(.*)$': resolve(__dirname, './controllers/$1'),
    '^@middleware/(.*)$': resolve(__dirname, './middleware/$1'),
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@routes/(.*)$': resolve(__dirname, './routes/$1'),
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@utils/(.*)$': resolve(__dirname, './utils/$1'),
    '^@types/(.*)$': '<rootDir>/types/$1'
  },
  testRegex: '(/tests/.*\\.(test|spec))\\.[tj]s$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  setupFilesAfterEnv: ['./tests/setup.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};

export default config;