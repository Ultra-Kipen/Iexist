// tests/unit/sample.test.ts
import db from '../../models';

describe('Sample Unit Test', () => {
  beforeEach(async () => {
    await Promise.all([
      db.SomeoneDayPost.destroy({ where: {}, force: true }),
      db.SomeoneDayTag.destroy({ where: {}, force: true }),
      db.EncouragementMessage.destroy({ where: {}, force: true })
    ]);
  });

  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should perform basic math', () => {
    expect(1 + 1).toBe(2);
  });
});