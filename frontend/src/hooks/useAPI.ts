// hooks/useAPI.ts
// API 요청을 위한 커스텀 훅

import { useState, useCallback } from 'react';
import { ApiResponse } from '../types';
import  client from '../services/api/client';

interface UseAPIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  immediate?: boolean;
}

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAPI<T = any, P = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options?: UseAPIOptions
) {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: !!options?.immediate,
    error: null,
  });
  
  const execute = useCallback(async (payload?: P, customUrl?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const finalUrl = customUrl || url;
      let response;
      
      if (method === 'GET') {
        response = await client.get<ApiResponse<T>>(finalUrl);
      } else if (method === 'POST') {
        response = await client.post<ApiResponse<T>>(finalUrl, payload);
      } else if (method === 'PUT') {
        response = await client.put<ApiResponse<T>>(finalUrl, payload);
      } else if (method === 'DELETE') {
        response = await client.delete<ApiResponse<T>>(finalUrl);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
      
      // API 응답 데이터 추출
      let responseData: T;
      if (response.data && response.data.data) {
        responseData = response.data.data as T;
      } else {
        responseData = response.data as T;
      }
      
      setState({
        data: responseData,
        loading: false,
        error: null,
      });
      
      if (options?.onSuccess) {
        options.onSuccess(responseData);
      }
      
      return responseData;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
      
      setState({
        data: null,
        loading: false,
        error: errorObj,
      });
      
      if (options?.onError) {
        options.onError(errorObj);
      }
      
      throw errorObj;
    }
  }, [url, method, options]);
  
  // 옵션에 immediate가 true로 설정된 경우 마운트 시 자동으로
  // API 요청을 실행 (useEffect 대신 IIFE 사용)
  if (options?.immediate && state.data === null && !state.loading && !state.error) {
    (async () => {
      try {
        await execute();
      } catch (error) {
        // onError 콜백에서 처리됨
      }
    })();
  }
  
  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({
        data: null,
        loading: false,
        error: null,
      });
    }, []),
  };
}

export default useAPI;