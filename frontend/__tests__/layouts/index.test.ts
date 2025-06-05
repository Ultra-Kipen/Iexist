// tests/layouts/index.test.ts
import * as LayoutExports from '../../src/layouts';

describe('Layout exports', () => {
  it('exports MainLayout component', () => {
    expect(LayoutExports.MainLayout).toBeDefined();
  });
  
  it('exports AuthLayout component', () => {
    expect(LayoutExports.AuthLayout).toBeDefined();
  });
  
  it('exports ContentLayout component', () => {
    expect(LayoutExports.ContentLayout).toBeDefined();
  });
  
  it('exports FormLayout component', () => {
    expect(LayoutExports.FormLayout).toBeDefined();
  });
  
  it('exports all required layout components', () => {
    const exportKeys = Object.keys(LayoutExports);
    expect(exportKeys).toContain('MainLayout');
    expect(exportKeys).toContain('AuthLayout');
    expect(exportKeys).toContain('ContentLayout');
    expect(exportKeys).toContain('FormLayout');
    expect(exportKeys.length).toBe(4); // 정확히 4개의 컴포넌트만 내보내는지 확인
  });
});