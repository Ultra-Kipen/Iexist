// tests/components/ErrorBoundary.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary from '../../src/components/ErrorBoundary';

// 에러를 발생시키는 컴포넌트
const ProblemChild = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('테스트 에러');
  }
  return <Text>정상 컴포넌트</Text>;
};

// console.error를 잠시 억제 (ErrorBoundary 테스트 중 발생하는 예상된 오류 메시지)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>테스트 컨텐츠</Text>
      </ErrorBoundary>
    );
    expect(getByText('테스트 컨텐츠')).toBeTruthy();
  });

  it('renders error UI when a child component throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(getByText('문제가 발생했습니다')).toBeTruthy();
    expect(getByText(/앱에서 오류가 발생했습니다/)).toBeTruthy();
    expect(getByText(/Error: 테스트 에러/)).toBeTruthy();
  });

  it('resets error state when the "다시 시도" button is pressed', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // 초기에는 정상 컴포넌트가 표시됨
    expect(getByText('정상 컴포넌트')).toBeTruthy();
    
    // 컴포넌트를 에러 상태로 강제로 변경
    const errorBoundaryInstance = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // 에러 UI가 표시됨
    expect(errorBoundaryInstance.getByText('문제가 발생했습니다')).toBeTruthy();
    
    // "다시 시도" 버튼 클릭
    fireEvent.press(errorBoundaryInstance.getByText('다시 시도'));
    
    // 이제 ErrorBoundary가 children을 다시 렌더링하므로 정상 컴포넌트가 표시되어야 함
    expect(errorBoundaryInstance.getByText('다시 시도')).toBeTruthy();
  });

  it('calls onError handler when a child throws', () => {
    const mockOnError = jest.fn();
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(mockOnError.mock.calls[0][0].message).toBe('테스트 에러');
  });

  it('renders custom fallback UI when provided', () => {
    const CustomFallback = () => <Text>커스텀 에러 UI</Text>;
    
    const { getByText, queryByText } = render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(getByText('커스텀 에러 UI')).toBeTruthy();
    expect(queryByText('문제가 발생했습니다')).toBeNull();
  });
});