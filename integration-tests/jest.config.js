module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/api-tests/**/*.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  testTimeout: 30000 // 30초로 전역 타임아웃 설정
};