// tests/setup.ts
import '@testing-library/jest-dom';

// LocalStorage 모킹
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// fetch 모킹을 위한 기본 설정
global.fetch = jest.fn();

// 테스트 타임아웃 설정
jest.setTimeout(15000);