// __tests__/mocks/services/socketService.mock.ts
type EventCallback = (...args: any[]) => void;
type EventListeners = Record<string, EventCallback[]>;

class MockSocketService {
  listeners: EventListeners = {};
  connectionStatus = false;

  connect = jest.fn().mockImplementation(() => {
    this.connectionStatus = true;
    if (this.listeners['connect']) {
      this.listeners['connect'].forEach(callback => callback());
    }
    return this;
  });

  disconnect = jest.fn().mockImplementation(() => {
    this.connectionStatus = false;
    if (this.listeners['disconnect']) {
      this.listeners['disconnect'].forEach(callback => callback());
    }
    return this;
  });

  isConnected = jest.fn().mockImplementation(() => {
    return this.connectionStatus;
  });

  on = jest.fn().mockImplementation((event: string, callback: EventCallback) => {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this;
  });

  off = jest.fn().mockImplementation((event: string, callback: EventCallback) => {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index !== -1) {
        this.listeners[event].splice(index, 1);
      }
    }
    return this;
  });

  emit = jest.fn().mockImplementation((event: string, ...args: any[]) => {
    // 서버로 이벤트 전송 모의
    return this;
  });

  // 테스트에서 이벤트를 트리거하기 위한 헬퍼 메서드
  triggerEvent = (event: string, ...args: any[]) => {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  };

  // 모든 리스너 초기화
  resetListeners = () => {
    this.listeners = {};
  };
}

export const mockSocketService = new MockSocketService();
export default mockSocketService;