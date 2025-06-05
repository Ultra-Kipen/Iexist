// __tests__/hooks/useCachedApiQuery.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useCachedApiQuery } from '../../src/hooks/useCachedApiQuery';
import { useCache } from '../../src/hooks/useCache';

// fetch 모킹
global.fetch = jest.fn();

// useCache 모킹
jest.mock('../../src/hooks/useCache', () => ({
  useCache: jest.fn(),
}));

describe('useCachedApiQuery', () => {
  const mockEndpoint = '/api/test';
  const mockParams = { id: 1, filter: 'active' };
  const mockData = { id: 1, name: 'Test Data' };
  
  // useCache 반환값 기본 설정
  const mockUseCacheReturn = {
    data: mockData,
    loading: false,
    error: null,
    refetch: jest.fn(),
    invalidateCache: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // useCache 모킹 설정
    (useCache as jest.Mock).mockReturnValue(mockUseCacheReturn);
    
    // fetch 모킹 설정
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockData,
      }),
    });
  });

  it('useCache를 올바른 파라미터로 호출한다', () => {
    renderHook(() => 
      useCachedApiQuery(mockEndpoint, mockParams)
    );
    
    // useCache 호출 확인
    expect(useCache).toHaveBeenCalledWith(
      `api:${mockEndpoint}:${JSON.stringify(mockParams)}`,
      expect.any(Function),
      { ttl: undefined, autoLoad: true }
    );
  });

  it('useCache에서 반환된 데이터, 로딩, 에러 상태를 반환한다', () => {
    const { result } = renderHook(() => 
      useCachedApiQuery(mockEndpoint, mockParams)
    );
    
    expect(result.current.data).toBe(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.refetch).toBe(mockUseCacheReturn.refetch);
    expect(result.current.invalidateCache).toBe(mockUseCacheReturn.invalidateCache);
  });

  it('fetchData 함수는 올바른 API 엔드포인트로 요청한다', async () => {
    // useCache 내부 fetchData 함수 추출
    let fetchDataFn: () => Promise<any>;
    
    (useCache as jest.Mock).mockImplementation((key, fetchFn) => {
      fetchDataFn = fetchFn;
      return mockUseCacheReturn;
    });
    
    renderHook(() => 
      useCachedApiQuery(mockEndpoint, mockParams)
    );
    
    // fetchData 함수 호출
    await (fetchDataFn as any)();
    
    // fetch 호출 확인
    expect(global.fetch).toHaveBeenCalledWith(
      `${mockEndpoint}?id=1&filter=active`
    );
  });

  it('API 응답이 실패하면 오류를 발생시킨다', async () => {
    // 실패 응답 모킹
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: false,
        error: '데이터를 가져오는데 실패했습니다.',
      }),
    });
    
    // useCache 내부 fetchData 함수 추출
    let fetchDataFn: () => Promise<any>;
    
    (useCache as jest.Mock).mockImplementation((key, fetchFn) => {
      fetchDataFn = fetchFn;
      return mockUseCacheReturn;
    });
    
    renderHook(() => 
      useCachedApiQuery(mockEndpoint, mockParams)
    );
    
    // fetchData 함수 호출 시 오류 발생 확인
    await expect((fetchDataFn as any)()).rejects.toThrow('데이터를 가져오는데 실패했습니다.');
  });

  it('onSuccess 콜백이 제공되면 데이터 로드 성공 시 호출된다', async () => {
    const mockOnSuccess = jest.fn();
    
    // useCache 내부 fetchData 함수 추출
    let fetchDataFn: () => Promise<any>;
    
    (useCache as jest.Mock).mockImplementation((key, fetchFn) => {
      fetchDataFn = fetchFn;
      return mockUseCacheReturn;
    });
    
    renderHook(() => 
      useCachedApiQuery(mockEndpoint, mockParams, { onSuccess: mockOnSuccess })
    );
    
    // fetchData 함수 호출
    await (fetchDataFn as any)();
    
    // onSuccess 콜백 호출 확인
    expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
  });

  it('HTTP 요청 실패 시 오류를 발생시킨다', async () => {
    // HTTP 오류 모킹
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });
    
    // useCache 내부 fetchData 함수 추출
    let fetchDataFn: () => Promise<any>;
    
    (useCache as jest.Mock).mockImplementation((key, fetchFn) => {
      fetchDataFn = fetchFn;
      return mockUseCacheReturn;
    });
    
    renderHook(() => 
      useCachedApiQuery(mockEndpoint, mockParams)
    );
    
    // fetchData 함수 호출 시 오류 발생 확인
    await expect((fetchDataFn as any)()).rejects.toThrow('API 요청 오류: 404');
  });

  it('onError 콜백이 제공되면 오류 발생 시 호출된다', () => {
    const mockOnError = jest.fn();
    const mockError = new Error('테스트 에러');
    
    // 에러 상태로 useCache 모킹
    (useCache as jest.Mock).mockReturnValue({
      ...mockUseCacheReturn,
      error: mockError,
    });
    
    renderHook(() => 
      useCachedApiQuery(mockEndpoint, mockParams, { onError: mockOnError })
    );
    
    // onError 콜백 호출 확인
    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it('ttl과 autoLoad 옵션을 useCache에 전달한다', () => {
    const ttl = 60000; // 1분
    const autoLoad = false;
    
    renderHook(() => 
      useCachedApiQuery(mockEndpoint, mockParams, { ttl, autoLoad })
    );
    
    // useCache 호출 확인
    expect(useCache).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
      { ttl, autoLoad }
    );
  });
});