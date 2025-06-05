// __tests__/testUtils.ts
import React, { ReactElement } from 'react';
import renderer from 'react-test-renderer';

// 간단한 렌더 함수
export function render(component: ReactElement) {
  const instance = renderer.create(component);
  
  return {
    ...instance,
    getByTestId: (testId: string) => {
      const el = instance.root.findByProps({ testID: testId });
      if (!el) throw new Error(`테스트 ID '${testId}'를 가진 요소를 찾을 수 없습니다`);
      return el;
    },
    getByText: (text: string) => {
      // node.type === 'Text' 비교에서 타입 오류 발생
      // 문자열 비교 대신 다른 방법 사용
      const el = instance.root.findAll(node => {
        // 노드가 문자열 children을 가지고 있는지 확인
        return node.props && 
               typeof node.props.children === 'string' && 
               node.props.children === text;
      })[0];
      if (!el) throw new Error(`'${text}' 텍스트를 가진 요소를 찾을 수 없습니다`);
      return el;
    }
  };
}

// 간단한 이벤트 함수
export const fireEvent = {
  press: (element: any) => {
    if (element.props.onPress) {
      element.props.onPress();
      return true;
    }
    return false;
  },
  changeText: (element: any, text: string) => {
    if (element.props.onChangeText) {
      element.props.onChangeText(text);
      return true;
    }
    return false;
  }
};