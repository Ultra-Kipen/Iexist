import db from '../../models';

describe('Sample Unit Test', () => {
  // 각 테스트 전에 테이블 초기화
  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should perform basic math', () => {
    expect(1 + 1).toBe(2);
  });
});
