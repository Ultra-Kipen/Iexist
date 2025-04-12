// __mocks__/models.ts
export const mockFindAndCountAll = jest.fn();
export const mockFindOne = jest.fn();
export const mockUpdate = jest.fn();
export const mockDestroy = jest.fn();
export const mockCommit = jest.fn();
export const mockRollback = jest.fn();

// 트랜잭션 객체 모의
export const transactionObj = {
  commit: mockCommit,
  rollback: mockRollback
};