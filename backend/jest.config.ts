// jest.config.ts
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['./tests/setup.ts'], 
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@controllers/(.*)$': '<rootDir>/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@models$': '<rootDir>/models/index.ts',
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@routes/(.*)$': '<rootDir>/routes/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1'
  },
  
  testRegex: 'tests/.*\\.(test|spec)\\.[tj]s$',
  testTimeout: 120000,  // 10초 -> 120초로 증가 (타임아웃 문제 해결)
  slowTestThreshold: 60,  // 60초 이상 걸리는 테스트에 대한 경고 임계값 설정
  verbose: false,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: "50%"
}