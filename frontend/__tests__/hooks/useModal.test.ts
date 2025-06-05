// __tests__/hooks/useModal.test.ts (계속)
// __tests__/hooks/useModal.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useModal } from '../../src/hooks/useModal';
describe('useModal', () => {
  it('기본 상태는 false(모달 숨김)이다', () => {
    const { result } = renderHook(() => useModal());
    
    expect(result.current.isVisible).toBe(false);
  });
it('initialState 매개변수로 초기 상태를 설정할 수 있다', () => {
    const { result } = renderHook(() => useModal(true));
    
    expect(result.current.isVisible).toBe(true);
  });

  it('showModal 함수는 isVisible을 true로 설정한다', () => {
    const { result } = renderHook(() => useModal());
    
    act(() => {
      result.current.showModal();
    });
    
    expect(result.current.isVisible).toBe(true);
  });

  it('hideModal 함수는 isVisible을 false로 설정한다', () => {
    const { result } = renderHook(() => useModal(true));
    
    act(() => {
      result.current.hideModal();
    });
    
    expect(result.current.isVisible).toBe(false);
  });

  it('toggleModal 함수는 isVisible 상태를 토글한다', () => {
    const { result } = renderHook(() => useModal(false));
    
    // false에서 true로 토글
    act(() => {
      result.current.toggleModal();
    });
    
    expect(result.current.isVisible).toBe(true);
    
    // true에서 false로 토글
    act(() => {
      result.current.toggleModal();
    });
    
    expect(result.current.isVisible).toBe(false);
  });

  it('반환된 함수들은 메모이제이션 된다', () => {
    const { result, rerender } = renderHook(() => useModal());
    
    const initialShowModal = result.current.showModal;
    const initialHideModal = result.current.hideModal;
    const initialToggleModal = result.current.toggleModal;
    
    // 리렌더
    rerender();
    
    // 함수 참조가 유지되는지 확인
    expect(result.current.showModal).toBe(initialShowModal);
    expect(result.current.hideModal).toBe(initialHideModal);
    expect(result.current.toggleModal).toBe(initialToggleModal);
  });
});