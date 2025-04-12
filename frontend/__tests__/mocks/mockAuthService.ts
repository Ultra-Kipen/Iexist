// __tests__/mocks/mockAuthService.ts
export const mockAuthService = {
    login: jest.fn().mockResolvedValue({ 
      data: { 
        success: true, 
        data: { 
          token: 'test-token', 
          user: { id: 1, username: 'testuser' } 
        } 
      } 
    }),
    logout: jest.fn().mockResolvedValue({ data: { success: true } })
  };