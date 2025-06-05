// __tests__/navigation/AuthStack.test.tsx
import React from 'react';
import fs from 'fs';
import path from 'path';

describe('AuthStack 소스 코드 검증', () => {
  let authStackSource;
  
  beforeAll(() => {
    // AuthStack.tsx 파일 읽기
    const authStackPath = path.resolve(__dirname, '../../src/navigation/AuthStack.tsx');
    authStackSource = fs.readFileSync(authStackPath, 'utf8');
  });
  
  it('AuthStack이 필요한 컴포넌트를 import해야 함', () => {
    expect(authStackSource).toContain('import React from');
    expect(authStackSource).toContain('import { createNativeStackNavigator }');
    expect(authStackSource).toContain('import LoginScreen from');
    expect(authStackSource).toContain('import RegisterScreen from');
    expect(authStackSource).toContain('import ApiTestScreen from'); // 테스트용 화면 확인
  });
  
  it('AuthStack이 네비게이션 타입을 정의해야 함', () => {
    expect(authStackSource).toContain('type AuthStackParamList');
    expect(authStackSource).toContain('Login: undefined');
    expect(authStackSource).toContain('Register: undefined');
    expect(authStackSource).toContain('ApiTest: undefined'); // 테스트용 화면 타입 확인
  });
  
  it('AuthStack이 Navigator를 생성해야 함', () => {
    expect(authStackSource).toContain('const Stack = createNativeStackNavigator');
  });
  
  it('AuthStack이 올바른 화면을 포함해야 함', () => {
    // screenOptions가 포함된 Navigator 확인
    expect(authStackSource).toContain('<Stack.Navigator');
    expect(authStackSource).toContain('screenOptions={{');
    expect(authStackSource).toContain('headerShown: false');
    
    // 화면 구성 확인
    expect(authStackSource).toContain('<Stack.Screen name="Login" component={LoginScreen}');
    expect(authStackSource).toContain('<Stack.Screen name="Register" component={RegisterScreen}');
    expect(authStackSource).toContain('<Stack.Screen name="ApiTest" component={ApiTestScreen}');
  });
  
  it('AuthStack이 올바르게 export되어야 함', () => {
    expect(authStackSource).toContain('export default AuthStack');
  });
  
  it('Navigator에 헤더 숨김 옵션이 있어야 함', () => {
    expect(authStackSource).toContain('headerShown: false');
  });
});