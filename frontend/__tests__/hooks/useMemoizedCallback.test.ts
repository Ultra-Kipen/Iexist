import { renderHook } from '@testing-library/react-hooks';
import { useMemoizedCallback } from '../../src/hooks/useMemoizedCallback';

describe('useMemoizedCallback', () => {
  it('should maintain reference equality across renders', () => {
    // 초기 콜백 함수 생성
    const callback = jest.fn((n) => n * 2);
    
    // 훅 렌더링
    const { result, rerender } = renderHook(
      ({ callback, deps }) => useMemoizedCallback(callback, deps),
      { initialProps: { callback, deps: [1] } }
    );
    
    // 초기 함수 참조 저장
    const initialCallback = result.current;
    
    // 의존성 변경 없이 리렌더링
    rerender({ callback, deps: [1] });
    
    // 함수 참조가 유지되는지 확인
    expect(result.current).toBe(initialCallback);
    
    // 함수 호출 테스트
    expect(result.current(5)).toBe(10);
    expect(callback).toHaveBeenCalledWith(5);
  });

  it('should update callback when dependencies change', () => {
    // 초기 콜백 함수 생성
    const initialCallback = jest.fn((n) => n * 2);
    
    // 훅 렌더링
    const { result, rerender } = renderHook(
      ({ callback, deps }) => useMemoizedCallback(callback, deps),
      { initialProps: { callback: initialCallback, deps: [1] } }
    );
    
    // 초기 함수 참조 저장
    const firstCallback = result.current;
    
    // 의존성 변경하여 리렌더링
    rerender({ callback: initialCallback, deps: [2] });
    
    // 함수 참조가 변경되는지 확인
    expect(result.current).not.toBe(firstCallback);
  });

  it('should update function behavior with new callback', () => {
    // 초기 프롭스
    let props = {
      callback: (n: number) => n * 2,
      deps: [1] as number[]
    };
    
    // 훅 렌더링
    const { result, rerender } = renderHook(
      () => useMemoizedCallback(props.callback, props.deps)
    );
    
    // 초기 함수 테스트
    expect(result.current(5)).toBe(10);
    
    // 콜백 변경
    props = {
      callback: (n: number) => n * 3,
      deps: [1]
    };
    
    rerender();
    
    // 새 콜백 로직이 적용되는지 확인
    expect(result.current(5)).toBe(15);
  });

  it('should handle empty dependencies array', () => {
    const callback = jest.fn((n) => n * 2);
    
    const { result, rerender } = renderHook(
      ({ callback }) => useMemoizedCallback(callback, []),
      { initialProps: { callback } }
    );
    
    const initialCallback = result.current;
    
    // 콜백 변경해도 의존성 배열이 비어있으면 함수 참조 유지
    const newCallback = jest.fn((n) => n * 3);
    rerender({ callback: newCallback });
    
    expect(result.current).toBe(initialCallback);
    
    // useMemoizedCallback은 콜백 함수의 참조는 유지하면서
    // 내부적으로는 최신 콜백을 사용하므로 결과는 15가 되어야 함
    expect(result.current(5)).toBe(15);
  });

  it('should capture the latest props inside the callback', () => {
    let multiplier = 2;
    
    const { result, rerender } = renderHook(
      () => useMemoizedCallback((n: number) => n * multiplier, [])
    );
    
    // 초기 함수 참조 저장
    const memoizedCallback = result.current;
    
    // 외부 변수 변경
    multiplier = 3;
    
    // 리렌더링
    rerender();
    
    // 함수 참조는 변경되지 않지만 내부 로직은 업데이트됨
    expect(result.current).toBe(memoizedCallback);
    expect(result.current(5)).toBe(15); // 최신 multiplier 값(3)이 반영됨
  });
});