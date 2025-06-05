// global-setup.ts
declare global {
  var __DEV__: boolean;
}

Object.defineProperty(global, '__DEV__', {
  value: true,
  writable: true,
  enumerable: true,
  configurable: true
});

global.__DEV__ = true;

export {};