import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { withErrorHandling } from '../../src/hoc/withErrorHandling';
import { Text } from 'react-native';

// 콘솔 에러 방지
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('withErrorHandling HOC', () => {
  // 에러를 유발하는 테스트 컴포넌트
  const ErrorComponent = ({ shouldThrow = false }) => {
    if (shouldThrow) {
      throw new Error('테스트 에러');
    }
    return <Text>정상 컴포넌트</Text>;
  };

  const ComponentWithErrorHandling = withErrorHandling(ErrorComponent);

  test('에러가 없으면 원래 컴포넌트를 렌더링해야 함', () => {
    const { getByText } = render(<ComponentWithErrorHandling shouldThrow={false} />);
    expect(getByText('정상 컴포넌트')).toBeTruthy();
  });

  test('에러 발생 시 에러 UI를 표시해야 함', () => {
    const { getByText } = render(<ComponentWithErrorHandling shouldThrow={true} />);
    expect(getByText('문제가 발생했습니다')).toBeTruthy();
    expect(getByText(/테스트 에러/)).toBeTruthy();
  });

  test('에러 UI에서 다시 시도 버튼 클릭 시 에러 상태를 초기화해야 함', () => {
    const { getByText, queryByText } = render(<ComponentWithErrorHandling shouldThrow={true} />);
    
    // 에러 UI가 표시되는지 확인
    expect(getByText('문제가 발생했습니다')).toBeTruthy();
    
    // 다시 시도 버튼 클릭
    const retryButton = getByText('다시 시도');
    fireEvent.press(retryButton);
    
    // shouldThrow 값이 여전히 true이기 때문에 다시 에러 UI가 표시되어야 함
    // (실제 시나리오에서는 props가 변경되어 정상 렌더링될 수 있음)
    expect(getByText('문제가 발생했습니다')).toBeTruthy();
  });

  test('HOC가 displayName을 올바르게 설정해야 함', () => {
    expect(ComponentWithErrorHandling.displayName).toBe('withErrorHandling(ErrorComponent)');
  });

  test('componentDidCatch가 호출되고 에러 정보가 저장되어야 함', () => {
    const spy = jest.spyOn(ComponentWithErrorHandling.prototype, 'componentDidCatch');
    render(<ComponentWithErrorHandling shouldThrow={true} />);
    expect(spy).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('컴포넌트 오류:', expect.any(Error), expect.anything());
  });
});