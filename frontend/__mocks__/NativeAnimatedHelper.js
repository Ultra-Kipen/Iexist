module.exports = {
    __esModule: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    removeAllListeners: jest.fn(),
    default: {
      startAnimatingWithNativeDriver: jest.fn(),
      stopAnimatingWithNativeDriver: jest.fn(),
    }
  };