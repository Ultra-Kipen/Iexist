// __mocks__/index.ts
const mockFindAndCountAll = jest.fn();
const mockFindOne = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();
const mockTransaction = jest.fn();
const mockCommit = jest.fn();
const mockRollback = jest.fn();

// 트랜잭션 객체 생성
const transactionObj = {
  commit: mockCommit,
  rollback: mockRollback
};

mockTransaction.mockResolvedValue(transactionObj);

export default {
  Notification: {
    findAndCountAll: mockFindAndCountAll,
    findOne: mockFindOne,
    update: mockUpdate,
    destroy: mockDestroy
  },
  sequelize: {
    transaction: mockTransaction
  }
};

export {
  mockFindAndCountAll,
  mockFindOne,
  mockUpdate,
  mockDestroy,
  mockTransaction,
  mockCommit,
  mockRollback,
  transactionObj
};