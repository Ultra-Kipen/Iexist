// __tests__/hooks/useToast.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useToast } from '../../src/hooks/useToast';
import { ToastController } from '../../src/components/Toast';

// ToastController 모킹
jest.mock('../../src/components/Toast', () => ({
  ToastController: {
    show: jest.fn(),
    hide: jest.fn(),
  },
}));

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('showToast 함수는 ToastController.show를 호출한다', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('테스트 메시지');
    });
    
    expect(ToastController.show).toHaveBeenCalledWith({
      message: '테스트 메시지',
      type: 'info',
      duration: 3000,
      position: 'bottom',
    });
  });

  it('showToast 함수는 type 매개변수를 적용한다', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('성공 메시지', 'success');
    });
    
    expect(ToastController.show).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '성공 메시지',
        type: 'success',
      })
    );
  });

  it('showToast 함수는 duration 매개변수를 적용한다', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('짧은 메시지', 'warning', 1000);
    });
    
    expect(ToastController.show).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '짧은 메시지',
        type: 'warning',
        duration: 1000,
      })
    );
  });

  it('hideToast 함수는 ToastController.hide를 호출한다', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.hideToast();
    });
    
    expect(ToastController.hide).toHaveBeenCalled();
  });

  it('반환된 함수들은 메모이제이션 된다', () => {
    const { result, rerender } = renderHook(() => useToast());
    
    const initialShowToast = result.current.showToast;
    const initialHideToast = result.current.hideToast;
    
    // 리렌더
    rerender();
    
    // 함수 참조가 유지되는지 확인
    expect(result.current.showToast).toBe(initialShowToast);
    expect(result.current.hideToast).toBe(initialHideToast);
  });
});