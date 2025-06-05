// global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'mock-touchable': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      testID?: string;
      onPress?: () => void;
    }, HTMLElement>;
  }
}

// 전역 네임스페이스에 __DEV__ 선언 추가
declare global {
  // 기존 내용 유지
  var __DEV__: boolean;
  
  // Jest 확장에 필요한 Matcher 인터페이스 추가
  namespace jest {
    interface Matchers<R> {
      toHaveStyle: (style: object) => R;
      toBeDisabled: () => R;
      toBeEnabled: () => R;
      toMatchObject: (object: object) => R;
      toBeTruthy: () => R;
    }
  }
}

export {};