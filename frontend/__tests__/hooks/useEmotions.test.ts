// __tests__/hooks/useEmotions.test.ts
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useEmotions } from '../../src/hooks/useEmotions';

// Mock useStore and related functionality
jest.mock('../../src/store', () => ({
  useStore: () => ({
    state: { emotions: [] },
    dispatch: jest.fn()
  })
}));

jest.mock('../../src/store/actions', () => ({
  actions: {
    setEmotions: jest.fn()
  }
}));

// Mock fetch API
const mockJsonPromise = Promise.resolve([
  { id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
  { id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' }
]);

const mockFetchPromise = Promise.resolve({
  ok: true,
  json: () => mockJsonPromise
});
global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);

describe('useEmotions Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should initialize with empty emotions and start loading', () => {
    const { result } = renderHook(() => useEmotions());
    
    // 초기 상태 확인 - loading은 fetchEmotions 호출로 인해 true로 시작
    expect(result.current.loading).toBe(true);
    expect(result.current.emotions).toEqual([]);
    expect(result.current.selectedEmotions).toEqual([]);
    expect(result.current.error).toBeNull();
  });
  
  it('should toggle emotion selection', () => {
    const { result } = renderHook(() => useEmotions());
    
    // 감정 선택 테스트
    act(() => {
      result.current.toggleEmotion(1);
    });
    
    // 선택된 감정 확인
    expect(result.current.selectedEmotions).toContain(1);
    
    // 다시 동일한 감정 선택시 제거되는지 테스트
    act(() => {
      result.current.toggleEmotion(1);
    });
    
    // 선택 해제 확인
    expect(result.current.selectedEmotions).not.toContain(1);
  });
  
  it('should select emotion', () => {
    const { result } = renderHook(() => useEmotions());
    
    // 감정 선택 테스트
    act(() => {
      result.current.selectEmotion(1);
    });
    
    expect(result.current.selectedEmotions).toContain(1);
    
    // 이미 선택된 감정 다시 선택해도 중복되지 않는지 테스트
    act(() => {
      result.current.selectEmotion(1);
    });
    
    expect(result.current.selectedEmotions.filter(id => id === 1).length).toBe(1);
  });
  
  it('should deselect emotion', () => {
    const { result } = renderHook(() => useEmotions());
    
    // 감정 선택 후 해제 테스트
    act(() => {
      result.current.selectEmotion(1);
      result.current.selectEmotion(2);
    });
    
    expect(result.current.selectedEmotions).toContain(1);
    expect(result.current.selectedEmotions).toContain(2);
    
    act(() => {
      result.current.deselectEmotion(1);
    });
    
    expect(result.current.selectedEmotions).not.toContain(1);
    expect(result.current.selectedEmotions).toContain(2);
  });
  
  it('should clear all selected emotions', () => {
    const { result } = renderHook(() => useEmotions());
    
    // 여러 감정 선택
    act(() => {
      result.current.selectEmotion(1);
      result.current.selectEmotion(2);
    });
    
    expect(result.current.selectedEmotions.length).toBe(2);
    
    // 모든 선택 해제
    act(() => {
      result.current.clearEmotions();
    });
    
    expect(result.current.selectedEmotions.length).toBe(0);
  });
  
  it('should handle fetch error', async () => {
    // 더 구체적인 fetch 실패 모킹
    global.fetch = jest.fn().mockImplementationOnce(() => 
      Promise.reject(new Error("감정 목록을 불러오는데 실패했습니다."))
    );
    
    const { result } = renderHook(() => useEmotions());
    
    // 초기 로딩 상태 확인
    expect(result.current.loading).toBe(true);
    
    // fetchEmotions 함수 호출
    await act(async () => {
      await result.current.fetchEmotions();
    });
    
    // 에러 상태 확인
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("감정 목록을 불러오는데 실패했습니다.");
  });
  it('should fetch emotions manually', async () => {
    const { result } = renderHook(() => useEmotions());
    
    // 초기 자동 fetch 제거
    global.fetch = jest.fn().mockClear();
    
    // 수동 fetch 설정
    global.fetch = jest.fn().mockImplementationOnce(() => mockFetchPromise);
    
    // fetchEmotions 함수 수동 호출
    await act(async () => {
      await result.current.fetchEmotions();
    });
    
    // fetch 호출 확인
    expect(global.fetch).toHaveBeenCalledWith('/api/emotions');
    
    // 로딩 상태 변화 확인
    expect(result.current.loading).toBe(false);
  });
});