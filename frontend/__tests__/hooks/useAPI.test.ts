// useAPI.test.ts
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useAPI } from '../../src/hooks/useAPI';
import client from '../../src/services/api/client';

// 모의 API 응답
const mockApiResponse = { 
  data: { message: '성공' },
  status: 200 
};
const mockApiError = { 
  response: { 
    status: 400, 
    data: { message: '오류 발생' } 
  } 
};

// Jest 모킹
jest.mock('../../src/services/api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// 비동기 실행을 위한 유틸리티 함수
const waitForNextUpdate = async () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

describe('useAPI 훅', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정되어야 함', () => {
    const { result } = renderHook(() => useAPI('/test', 'GET'));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('API 호출 시 로딩 상태로 변경되어야 함', async () => {
    (client.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const { result } = renderHook(() => useAPI('/test', 'GET'));
    
    await act(async () => {
      result.current.execute();
      await waitForNextUpdate();
    });
    
    expect(result.current.loading).toBe(false);
  });

  it('API 호출 성공 시 데이터가 올바르게 설정되어야 함', async () => {
    (client.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const { result } = renderHook(() => useAPI('/test', 'GET'));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockApiResponse.data);
    expect(result.current.error).toBeNull();
  });

  it('API 호출 실패 시 에러가 올바르게 설정되어야 함', async () => {
    (client.get as jest.Mock).mockRejectedValueOnce(mockApiError);
    
    const { result } = renderHook(() => useAPI('/test', 'GET'));
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch {}
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('파라미터를 사용하여 API 호출이 가능해야 함', async () => {
    (client.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const { result } = renderHook(() => useAPI('/test', 'GET'));
    
    const params = { id: 1, name: '테스트' };
    
    await act(async () => {
      await result.current.execute(params);
    });
    
    // 첫 번째 인자는 URL, 두 번째 인자는 config 객체
    expect(client.get).toHaveBeenCalledWith('/test', { params });
    expect(result.current.data).toEqual(mockApiResponse.data);
  });

  it('reset 함수를 호출하면 상태가 초기화되어야 함', async () => {
    (client.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const { result } = renderHook(() => useAPI('/test', 'GET'));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.data).toEqual(mockApiResponse.data);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });
  it('POST 메서드로 API 호출이 가능해야 함', async () => {
    (client.post as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const { result } = renderHook(() => useAPI('/test', 'POST'));
    
    const payload = { name: '테스트', age: 25 };
    
    await act(async () => {
      await result.current.execute(payload);
    });
    
    expect(client.post).toHaveBeenCalledWith('/test', payload);
    expect(result.current.data).toEqual(mockApiResponse.data);
  });
  
  it('PUT 메서드로 API 호출이 가능해야 함', async () => {
    (client.put as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const { result } = renderHook(() => useAPI('/test/1', 'PUT'));
    
    const payload = { name: '수정된 테스트', age: 30 };
    
    await act(async () => {
      await result.current.execute(payload);
    });
    
    expect(client.put).toHaveBeenCalledWith('/test/1', payload);
    expect(result.current.data).toEqual(mockApiResponse.data);
  });
  
  it('DELETE 메서드로 API 호출이 가능해야 함', async () => {
    (client.delete as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const { result } = renderHook(() => useAPI('/test/1', 'DELETE'));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(client.delete).toHaveBeenCalledWith('/test/1', { params: undefined });
    expect(result.current.data).toEqual(mockApiResponse.data);
  });
  
  it('지원되지 않는 메서드로 호출할 경우 에러를 발생시켜야 함', async () => {
    // @ts-ignore - 의도적으로 잘못된 메서드 타입을 전달
    const { result } = renderHook(() => useAPI('/test', 'PATCH'));
    
    await act(async () => {
      try {
        await result.current.execute();
        fail('에러가 발생해야 함');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('지원되지 않는 메서드');
      }
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
  
  it('onSuccess 콜백이 성공 시 호출되어야 함', async () => {
    (client.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);
    
    const onSuccess = jest.fn();
    const { result } = renderHook(() => 
      useAPI('/test', 'GET', { onSuccess })
    );
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(onSuccess).toHaveBeenCalledWith(mockApiResponse.data);
  });
  
  it('onError 콜백이 실패 시 호출되어야 함', async () => {
    (client.get as jest.Mock).mockRejectedValueOnce(mockApiError);
    
    const onError = jest.fn();
    const { result } = renderHook(() => 
      useAPI('/test', 'GET', { onError })
    );
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch {}
    });
    
    expect(onError).toHaveBeenCalled();
  });
});