// types.d.ts

declare module '@testing-library/react-native' {
    // RenderResult 인터페이스 정의
    export interface RenderResult {
      getByText: (text: string) => any;
      getByTestId: (testId: string) => any;
      queryByText: (text: string) => any | null;
      queryByTestId: (testId: string) => any | null;
      getAllByText: (text: string) => any[];
      getAllByTestId: (testId: string) => any[];
      UNSAFE_getByType: (type: any) => any;
      // 필요한 다른 메서드들도 추가할 수 있습니다
    }
  
    // render 함수 정의
    export function render(
      component: React.ReactElement,
      options?: any
    ): RenderResult;
  
    // fireEvent 정의
    export const fireEvent: {
      press: (element: any) => void;
      changeText: (element: any, text: string) => void;
      scroll: (element: any, eventData?: any) => void;
      // 다른 이벤트들도 필요에 따라 추가
      [key: string]: any;
    };
  }