// __tests__/mocks/navigation/navigationMock.ts
export const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn().mockImplementation((event, callback) => {
      return { remove: jest.fn() };
    }),
    dispatch: jest.fn(),
    isFocused: jest.fn().mockReturnValue(true),
    canGoBack: jest.fn().mockReturnValue(true),
    dangerouslyGetParent: jest.fn().mockReturnValue(null),
    dangerouslyGetState: jest.fn().mockReturnValue({
      routes: [{ name: 'Home' }],
      index: 0,
    }),
    setOptions: jest.fn(),
    reset: jest.fn()
  };
  
  export const mockRoute = {
    params: {},
    key: 'mockRouteKey',
    name: 'Home'
  };
  
  export const createMockRoute = (name: string, params: any = {}) => ({
    params,
    key: `mockRouteKey-${name}`,
    name
  });
  
  // 네비게이션 스택 모의
  export const createMockNavigationStack = (screens: string[] = []) => {
    const routes = screens.map((name, index) => ({
      key: `route-${index}`,
      name,
      params: {}
    }));
    
    return {
      ...mockNavigation,
      dangerouslyGetState: jest.fn().mockReturnValue({
        routes,
        index: routes.length - 1
      })
    };
  };