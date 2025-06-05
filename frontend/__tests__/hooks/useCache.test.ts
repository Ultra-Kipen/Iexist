// __tests__/hooks/useCache.test.ts
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks';
import { useCache } from '../../src/hooks/useCache';
import { globalCache, MemoryCache } from '../../src/utils/cache';

// 전역 캐시 모킹
jest.mock('../../src/utils/cache', () => {
  const mockGlobalCache = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  };
  
  // 함수가 호출될 때마다 새 객체 반환하도록 구현
  const MockMemoryCache = jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  }));
  
  return {
    globalCache: mockGlobalCache,
    MemoryCache: MockMemoryCache,
  };
});

// 훅의 반환 타입 정의
interface CacheHookResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: (force?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

describe('useCache', () => {
  const testKey = 'testKey';
  const testData = { id: 1, name: 'Test Data' };
  let mockFetchFn: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // 각 테스트마다 새로운 mock 함수 생성
    mockFetchFn = jest.fn().mockResolvedValue(testData);
  });

  it('캐시에 데이터가 없으면 fetchFn을 호출한다', async () => {
    // 캐시에 데이터 없음
    (globalCache.get as jest.Mock).mockReturnValue(undefined);
    
    // 실제 act 내부에서 추가 호출을 방지하기 위해 앞서 정의한 mockFetchFn 사용
    let hookResult: RenderHookResult<unknown, CacheHookResult<typeof testData>>;
    
    await act(async () => {
      hookResult = renderHook(() => useCache<typeof testData>(testKey, mockFetchFn));
      // 비동기 작업이 완료될 때까지 기다림
    });
    
    const { result } = hookResult!;
    
    // 로드 완료 후 상태
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(testData);
    expect(result.current.error).toBeNull();
    
    // fetchFn이 호출되었는지 확인
    expect(mockFetchFn).toHaveBeenCalledTimes(1);
    
    // 캐시에 데이터 저장 확인
    expect(globalCache.set).toHaveBeenCalledWith(testKey, testData, undefined);
  });

  it('캐시에 데이터가 있으면 fetchFn을 호출하지 않는다', async () => {
    // 캐시에 데이터 있음
    (globalCache.get as jest.Mock).mockReturnValue(testData);
    
    const { result } = renderHook(() => 
      useCache<typeof testData>(testKey, mockFetchFn)
    );
    
    // 캐시된 데이터가 즉시 사용됨
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(testData);
    expect(result.current.error).toBeNull();
    
    // fetchFn이 호출되지 않음
    expect(mockFetchFn).not.toHaveBeenCalled();
  });

  it('refetch 함수로 데이터를 강제로 다시 가져올 수 있다', async () => {
    // 캐시에 데이터 있음
    (globalCache.get as jest.Mock).mockReturnValue(testData);
    
    const { result } = renderHook(() => 
      useCache<typeof testData>(testKey, mockFetchFn)
    );
    
    // 초기 상태 - 캐시된 데이터
    expect(result.current.data).toEqual(testData);
    
    // 새 데이터
    const newData = { id: 2, name: 'New Test Data' };
    mockFetchFn.mockResolvedValueOnce(newData);
    
    // 강제 재조회
    await act(async () => {
      await result.current.refetch(true);
    });
    
    // 로드 완료 후 상태
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(newData);
    
    // fetchFn이 호출되었는지 확인
    expect(mockFetchFn).toHaveBeenCalledTimes(1);
    
    // 캐시 업데이트 확인
    expect(globalCache.set).toHaveBeenCalledWith(testKey, newData, undefined);
  });

  it('invalidateCache 함수로 캐시를 무효화하고 데이터를 다시 가져올 수 있다', async () => {
    // 캐시에 데이터 있음
    (globalCache.get as jest.Mock).mockReturnValue(testData);
    
    const { result } = renderHook(() => 
      useCache<typeof testData>(testKey, mockFetchFn)
    );
    
    // 초기 상태 - 캐시된 데이터
    expect(result.current.data).toEqual(testData);
    
    // 캐시 무효화
    await act(async () => {
      await result.current.invalidateCache();
    });
    
    // 캐시 삭제 확인
    expect(globalCache.delete).toHaveBeenCalledWith(testKey);
    
    // 로드 완료 후 상태
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(testData);
    
    // fetchFn이 호출되었는지 확인
    expect(mockFetchFn).toHaveBeenCalledTimes(1);
  });

  it('fetchFn 오류 시 에러 상태를 설정한다', async () => {
    // 캐시에 데이터 없음
    (globalCache.get as jest.Mock).mockReturnValue(undefined);
    
    const testError = new Error('데이터 로드 실패');
    // 이 특정 테스트에 대해서만 rejectedValue 설정
    const errorMockFetch = jest.fn().mockRejectedValue(testError);
    
    let hookResult: RenderHookResult<unknown, CacheHookResult<typeof testData>>;
    await act(async () => {
      hookResult = renderHook(() => useCache<typeof testData>(testKey, errorMockFetch));
      // 비동기 작업이 완료될 때까지 기다림
    });
    
    const { result } = hookResult!;
    
    // 에러 발생 후 상태
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(testError);
    
    // 캐시 설정 안 됨
    expect(globalCache.set).not.toHaveBeenCalled();
  });

  it('ttl 옵션을 캐시 설정에 적용한다', async () => {
    // 캐시에 데이터 없음
    (globalCache.get as jest.Mock).mockReturnValue(undefined);
    
    const ttl = 60000; // 1분
    
    let hookResult: RenderHookResult<unknown, CacheHookResult<typeof testData>>;
    await act(async () => {
      hookResult = renderHook(() => useCache<typeof testData>(testKey, mockFetchFn, { ttl }));
      // 비동기 작업이 완료될 때까지 기다림
    });
    
    // ttl 옵션 적용 확인
    expect(globalCache.set).toHaveBeenCalledWith(testKey, testData, ttl);
  });

  it('autoLoad=false 옵션으로 자동 로드를 비활성화할 수 있다', () => {
    const { result } = renderHook(() => 
      useCache<typeof testData>(testKey, mockFetchFn, { autoLoad: false })
    );
    
    // 자동 로드 비활성화 - fetchFn 호출되지 않음
    expect(mockFetchFn).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('사용자 지정 캐시 인스턴스를 사용할 수 있다', async () => {
    // 사용자 정의 캐시
    const customCache = new MemoryCache();
    
    // 전역 캐시가 호출되지 않도록 모든 get 호출 초기화
    (globalCache.get as jest.Mock).mockClear();
    (globalCache.set as jest.Mock).mockClear();
    
    // 사용자 정의 캐시에 데이터 없음
    (customCache.get as jest.Mock).mockReturnValue(undefined);
    
    let hookResult: RenderHookResult<unknown, CacheHookResult<typeof testData>>;
    await act(async () => {
      hookResult = renderHook(() => useCache<typeof testData>(testKey, mockFetchFn, { cacheInstance: customCache }));
      // 비동기 작업이 완료될 때까지 기다림
    });
    
    const { result } = hookResult!;
    
    // 사용자 정의 캐시 사용 확인
    expect(customCache.get).toHaveBeenCalledWith(testKey);
    expect(customCache.set).toHaveBeenCalledWith(testKey, testData, undefined);
    
    // 전역 캐시 사용 안 함 확인
    expect(globalCache.get).not.toHaveBeenCalled();
    expect(globalCache.set).not.toHaveBeenCalled();
  });
});