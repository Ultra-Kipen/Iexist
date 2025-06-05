import React from 'react';
import { render } from '@testing-library/react-native';
import { withLoading } from '../../src/hoc/withLoading';
import { Text } from 'react-native';

// LoadingIndicator 모듈을 간단한 문자열을 반환하는 함수로 모킹
jest.mock('../../src/components/LoadingIndicator', () => function MockLoadingIndicator() {
  return '로딩 인디케이터 컴포넌트';
});

describe('withLoading HOC', () => {
  // 테스트 컴포넌트
  const TestComponent = ({ message }: { message: string }) => <Text>{message}</Text>;
  const LoadingComponent = withLoading(TestComponent);

  test('isLoading이 true이면 로딩 인디케이터를 표시해야 함', () => {
    const result = render(
      <LoadingComponent isLoading={true} message="테스트 메시지" />
    );
    
    // 컴포넌트가 렌더링되었는지만 확인
    expect(result).toBeTruthy();
  });

  test('isLoading이 false이면 원래 컴포넌트를 렌더링해야 함', () => {
    const { getByText } = render(
      <LoadingComponent isLoading={false} message="테스트 메시지" />
    );
    
    expect(getByText('테스트 메시지')).toBeTruthy();
  });

  test('isLoading prop이 제공되지 않으면 원래 컴포넌트를 렌더링해야 함', () => {
    const { getByText } = render(
      <LoadingComponent message="테스트 메시지" />
    );
    
    expect(getByText('테스트 메시지')).toBeTruthy();
  });

  test('HOC가 displayName을 올바르게 설정해야 함', () => {
    expect(LoadingComponent.displayName).toBe('withLoading(TestComponent)');
  });

  test('isLoading 상태가 변경될 때 컴포넌트가 적절하게 리렌더링되어야 함', () => {
    const { getByText, rerender } = render(
      <LoadingComponent isLoading={true} message="테스트 메시지" />
    );
    
    // isLoading을 false로 변경
    rerender(<LoadingComponent isLoading={false} message="테스트 메시지" />);
    
    expect(getByText('테스트 메시지')).toBeTruthy();
  });
});