// jest.config.js
module.exports = {
    preset: 'react-native',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['./__tests__/jest.setup.ts'],
      // 경로 수정
    testMatch: ["**/__tests__/**/*.test.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    transformIgnorePatterns: [
      "node_modules/(?!(react-native|@react-native|react-native-vector-icons|react-native-paper|@react-navigation)/)"
    ],
    moduleNameMapper: {
      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
       'axios-mock-adapter': '<rootDir>/node_modules/axios-mock-adapter'
    }
  };