// tests/jest.test.ts
describe('Jest 설정 테스트', () => {
  test('기본 테스트 동작 확인', () => {
    expect(true).toBe(true);
  });

  test('비동기 테스트 동작 확인', async () => {
    const result = await Promise.resolve(true);
    expect(result).toBe(true);
  });

  test('타입스크립트 문법 동작 확인', () => {
    interface TestInterface {
      id: number;
      name: string;
    }
    
    const testObj: TestInterface = {
      id: 1,
      name: 'test'
    };
    
    expect(testObj.id).toBe(1);
    expect(testObj.name).toBe('test');
  });
});