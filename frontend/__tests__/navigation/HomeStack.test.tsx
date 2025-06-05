// __tests__/navigation/HomeStack.test.tsx
import React from 'react';
import fs from 'fs';
import path from 'path';

describe('HomeStack 소스 코드 검증', () => {
  let homeStackSource;
  
  beforeAll(() => {
    // HomeStack.tsx 파일 읽기
    const homeStackPath = path.resolve(__dirname, '../../src/navigation/HomeStack.tsx');
    homeStackSource = fs.readFileSync(homeStackPath, 'utf8');
  });
  
  it('HomeStack이 필요한 컴포넌트를 import해야 함', () => {
    expect(homeStackSource).toContain('import React from');
    expect(homeStackSource).toContain('import { createNativeStackNavigator }');
    expect(homeStackSource).toContain('import HomeScreen from');
    expect(homeStackSource).toContain('import EmotionLogScreen from');
  });
  
  it('HomeStack이 네비게이션 타입을 정의해야 함', () => {
    expect(homeStackSource).toContain('type HomeStackParamList');
    expect(homeStackSource).toContain('HomeMain: undefined');
    expect(homeStackSource).toContain('EmotionLog: undefined');
  });
  
  it('HomeStack이 네비게이션 스택을 생성해야 함', () => {
    expect(homeStackSource).toContain('const Stack = createNativeStackNavigator');
  });
  
  it('HomeStack이 올바른 화면을 포함해야 함', () => {
    expect(homeStackSource).toContain('<Stack.Navigator>');
    expect(homeStackSource).toContain('<Stack.Screen name="HomeMain" component={HomeScreen}');
    expect(homeStackSource).toContain('<Stack.Screen name="EmotionLog" component={EmotionLogScreen}');
  });
  
  it('HomeStack이 화면 옵션을 설정해야 함', () => {
    expect(homeStackSource).toContain('options={{ title: \'나의 하루\' }}');
    expect(homeStackSource).toContain('options={{ title: \'감정 기록\' }}');
  });
  
  it('HomeStack이 올바르게 export되어야 함', () => {
    expect(homeStackSource).toContain('export default HomeStack');
  });
});