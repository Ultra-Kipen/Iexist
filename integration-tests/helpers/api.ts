// helpers/api.ts (수정)
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// 백엔드 API 기본 URL
export const API_URL = 'http://localhost:3000/api';

// 안전하게 오류를 처리하는 함수
const handleSafeError = (error: any): never => {
  // 순환 참조가 있을 수 있는 속성들을 제거하고 오류 복제
  const safeError: any = {
    message: error.message,
    name: error.name,
  };
  
  if (error.response) {
    safeError.response = {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      headers: error.response.headers
    };
  }
  
  if (error.config) {
    safeError.config = {
      url: error.config.url,
      method: error.config.method,
      baseURL: error.config.baseURL
    };
  }
  
  throw safeError;
};

// 공통 API 클라이언트 설정
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 10000에서 30000 또는 그 이상으로 증가
  headers: {
    'Content-Type': 'application/json'
  },
  // 추가: HTTP 연결을 유지하지 않도록 설정 
  httpAgent: new (require('http').Agent)({ keepAlive: false }), 
  httpsAgent: new (require('https').Agent)({ keepAlive: false })
});

// 응답 인터셉터 추가 - 순환 참조 방지
apiClient.interceptors.response.use(
  (response) => {
    // 원본 응답에서 필요한 데이터만 추출
    const safeResponse = {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
    return safeResponse as AxiosResponse;
  },
  (error) => {
    return Promise.reject(handleSafeError(error));
  }
);

// helpers/api.ts에서 토큰 설정 부분 수정
// api.ts에 추가할 코드

// 전역 토큰 상태
let globalToken: string | null = null;

// 토큰 설정 함수 수정
export const setAuthToken = (token: string): void => {
  if (!token) {
    console.error('토큰이 비어 있습니다!');
    return;
  }
  
  // 토큰을 전역 변수에 저장
  globalToken = token;
  
  // 콘솔에 토큰 출력 (디버깅용)
  console.log('토큰 설정:', token.substring(0, 10) + '...');
  
  // 명시적으로 모든 요청에 토큰 추가
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // 토큰이 제대로 설정되었는지 확인
  const currentToken = apiClient.defaults.headers.common['Authorization'];
  console.log('헤더에 설정된 토큰:', currentToken ? '설정됨' : '설정 안됨');
  
  // 모든 API 요청 함수에서 사용할 수 있도록 헤더 설정 재확인
  setTimeout(() => {
    const verifyToken = apiClient.defaults.headers.common['Authorization'];
    if (!verifyToken) {
      console.warn('토큰이 헤더에서 사라졌습니다. 다시 설정합니다.');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, 100);
};

// 토큰 가져오기 함수 추가
export const getAuthToken = (): string | null => {
  return globalToken;
};

// api 객체의 각 메소드에서 토큰 적용 확인
const checkToken = () => {
  // apiClient에 토큰이 제대로 설정되어 있는지 확인
  const token = (apiClient as any)._token;
  if (!token) {
    console.warn('API 호출 시 인증 토큰이 설정되지 않았습니다.');
  }
  return token != null;
};

// 토큰 제거 함수
export const clearAuthToken = (): void => {
  delete apiClient.defaults.headers.common['Authorization'];
};

// API 호출 헬퍼 함수들
export const api = {
  // 로그인 API
  login: async (email: string, password: string): Promise<AxiosResponse> => {
    try {
      return await apiClient.post('/auth/login', { email, password });
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
// helpers/api.ts에 추가할 코드
// api 객체에 다음 함수들을 추가하세요

// 사용자 프로필 업데이트 API
  updateUserProfile: async (profileData: any): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.put('/users/profile', profileData);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/users/profile)가 없어 다른 경로 시도');
          return await apiClient.put('/users', profileData);
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },

// 사용자 알림 설정 업데이트 API
  updateNotificationSettings: async (settingsData: any): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.put('/users/notifications', settingsData);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.put('/users/settings/notifications', settingsData);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },

 // 사용자 통계 조회 API
  getUserStats: async (): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get('/users/stats');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get('/users/statistics');
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
// helpers/api.ts에 추가할 코드
// api 객체에 다음 속성을 추가하세요

// 알림 관련 API
notifications: {
  // 알림 목록 조회
  getAll: async (): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.get('/notifications');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/notifications)가 없어 다른 경로 시도');
          return await apiClient.get('/users/notifications');
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 읽지 않은 알림 개수 조회
  getUnreadCount: async (): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get('/notifications/unread/count');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get('/users/notifications/unread');
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 알림 읽음으로 표시
  markAsRead: async (id: number): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.patch(`/notifications/${id}/read`, {});
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.put(`/notifications/${id}`, { is_read: true });
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 모든 알림 읽음으로 표시
  markAllAsRead: async (): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.post('/notifications/read-all', {});
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.put('/notifications/all', { is_read: true });
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
   testTrigger: async (): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.post('/notifications/test-trigger');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.post('/test/notifications');
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  }

},

// helpers/api.ts에 추가할 코드
// api 객체에 다음 속성을 추가하세요

// 태그 관련 API
tags: {
  // 태그 생성
  create: async (tagData: any): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.post('/tags', tagData);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/tags)가 없어 다른 경로 시도');
          return await apiClient.post('/api/tags', tagData);
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 태그 목록 조회
  getAll: async (): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get('/tags');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get('/api/tags');
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 특정 태그로 게시물 검색
  getPostsByTag: async (id: number): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get(`/tags/${id}/posts`);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get(`/posts?tag_id=${id}`);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 태그 삭제
  delete: async (id: number): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.delete(`/tags/${id}`);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.delete(`/api/tags/${id}`);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  }
},
// helpers/api.ts에 추가할 코드
// api 객체에 다음 속성을 추가하세요

// 목표 관련 API
goals: {
  // 목표 생성
  create: async (goalData: any): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.post('/goals', goalData);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/goals)가 없어 다른 경로 시도');
          return await apiClient.post('/users/goals', goalData);
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 목표 목록 조회
  getAll: async (): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get('/goals');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get('/users/goals');
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 특정 목표 조회
  getById: async (id: number): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get(`/goals/${id}`);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get(`/users/goals/${id}`);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 목표 진행 상황 업데이트
  updateProgress: async (id: number, data: any): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.patch(`/goals/${id}/progress`, data);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.put(`/users/goals/${id}`, data);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 목표 삭제
  delete: async (id: number): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.delete(`/goals/${id}`);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.delete(`/users/goals/${id}`);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  }
},
// helpers/api.ts에 추가할 코드
// api 객체에 다음 속성을 추가하세요

// 통계 관련 API
stats: {
  // 감정 통계 조회
  getEmotionStats: async (): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.get('/stats/emotions');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/stats/emotions)가 없어 다른 경로 시도');
          return await apiClient.get('/emotions/stats');
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 활동 통계 조회
  getActivityStats: async (): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get('/stats/activities');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get('/users/stats');
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 기간별 감정 분석 조회
  getEmotionAnalysisByPeriod: async (startDate: string, endDate: string): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get('/stats/emotions/analysis', {
          params: { start_date: startDate, end_date: endDate }
        });
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 다른 가능한 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get('/emotions/analysis', {
            params: { start_date: startDate, end_date: endDate }
          });
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  }
},
// helpers/api.ts에 추가할 코드
// api 객체에 다음 속성을 추가하세요

// 검색 관련 API
search: {
  // 게시물 검색
  posts: async (query: string): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.get('/search/posts', { params: { q: query } });
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/search/posts)가 없어 다른 경로 시도');
          return await apiClient.get('/posts/search', { params: { query } });
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 사용자 검색
  users: async (query: string): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get('/search/users', { params: { q: query } });
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get('/users/search', { params: { query } });
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
 // helpers/api.ts의 search.tags 함수 수정
// 태그 검색
tags: async (query: string, paramName?: string): Promise<AxiosResponse> => {
  try {
    // 기본값으로 'q' 사용, 매개변수가 제공된 경우 해당 값 사용
    const actualParamName = paramName || 'q';
    
    try {
      // 파라미터 이름을 동적으로 설정
      const params: any = {};
      params[actualParamName] = query;
      
      return await apiClient.get('/search/tags', { params });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // 다른 가능한 경로 시도
        console.log('첫 번째 경로가 없어 다른 경로 시도');
        
        // 파라미터 이름을 동적으로 설정
        const params: any = {};
        params[actualParamName] = query;
        
        return await apiClient.get('/tags/search', { params });
      } else if (error.response && error.response.status === 400) {
        // API가 다른 파라미터 이름을 기대하는 경우
        throw error; // 상위 호출자가 다른 파라미터 이름으로 다시 시도할 수 있도록 오류 전달
      }
      throw error;
    }
  } catch (error: any) {
    return Promise.reject(handleSafeError(error));
  }
},
  
  // 통합 검색
// helpers/api.ts의 search.all 함수 수정
// 통합 검색
all: async (query: string): Promise<AxiosResponse> => {
  try {
    try {
      return await apiClient.get('/search', { params: { q: query } });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // 다른 가능한 경로 시도
        console.log('첫 번째 경로가 없어 다른 경로 시도');
        try {
          return await apiClient.get('/search/all', { params: { query } });
        } catch (secondError: any) {
          if (secondError.response && secondError.response.status === 404) {
            // 세 번째 경로 시도
            console.log('두 번째 경로도 없어 세 번째 경로 시도');
            
            // 다른 API 함수를 개별적으로 호출하여 결과 수동 통합
            const postsPromise = api.search.posts(query).catch(e => ({ data: { data: [] } }));
            const usersPromise = api.search.users(query).catch(e => ({ data: { data: [] } }));
            
            // 모든 API 응답을 병렬로 처리
            const [postsResponse, usersResponse] = await Promise.all([postsPromise, usersPromise]);
            
            // 통합 결과 구성
            const combinedResult = {
              posts: postsResponse.data.data || postsResponse.data || [],
              users: usersResponse.data.data || usersResponse.data || []
            };
            
            // AxiosResponse와 유사한 구조로 반환
            return {
              data: {
                data: combinedResult,
                status: 'success',
                message: '통합 검색 결과'
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: {} as any
            } as AxiosResponse;
          }
          throw secondError;
        }
      }
      throw error;
    }
  } catch (error: any) {
    return Promise.reject(handleSafeError(error));
  }
}
},
// 위로의 벽 관련 API
comfortWall: {
  // 게시물 생성
  create: async (postData: any): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.post('/comfort-wall', postData);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/comfort-wall)가 없어 다른 경로 시도');
          return await apiClient.post('/comfort-walls', postData);
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 목록 조회
  getAll: async (): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.get('/comfort-wall');
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/comfort-wall)가 없어 다른 경로 시도');
          return await apiClient.get('/comfort-walls');
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 특정 게시물 조회
  getById: async (id: number): Promise<AxiosResponse> => {
    try {
      return await apiClient.get(`/comfort-wall/${id}`);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // 경로가 404면 다른 경로 시도
        try {
          return await apiClient.get(`/comfort-walls/${id}`);
        } catch (innerError: any) {
          return Promise.reject(handleSafeError(innerError));
        }
      }
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 업데이트
  update: async (id: number, data: any): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.patch(`/comfort-wall/${id}`, data);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.patch(`/comfort-walls/${id}`, data);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 삭제
  delete: async (id: number): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.delete(`/comfort-wall/${id}`);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.delete(`/comfort-walls/${id}`);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 좋아요
  like: async (id: number): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.post(`/comfort-wall/${id}/like`, {});
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.post(`/comfort-walls/${id}/like`, {});
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 댓글 작성
  addComment: async (id: number, commentData: any): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.post(`/comfort-wall/${id}/comments`, commentData);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.post(`/comfort-walls/${id}/comments`, commentData);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 댓글 조회
  getComments: async (id: number): Promise<AxiosResponse> => {
    try {
      try {
        return await apiClient.get(`/comfort-wall/${id}/comments`);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로가 없어 다른 경로 시도');
          return await apiClient.get(`/comfort-walls/${id}/comments`);
        }
        throw error;
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  }
},
  // 누군가의 하루 API
  someoneDay: {
    create: (postData: any) => apiClient.post('/someone-day', postData),
    getAll: (params?: any) => apiClient.get('/someone-day', { params }),
    getById: (postId: number) => apiClient.get(`/someone-day/${postId}`),
    update: (postId: number, postData: any) => apiClient.put(`/someone-day/${postId}`, postData),
    delete: (postId: number) => apiClient.delete(`/someone-day/${postId}`),
    like: (postId: number) => apiClient.post(`/someone-day/${postId}/like`),
    addComment: (postId: number, commentData: any) => apiClient.post(`/someone-day/${postId}/comments`, commentData),
    getComments: (postId: number) => apiClient.get(`/someone-day/${postId}/comments`),
  },
  // 회원가입 API
  register: async (userData: {
    username: string,
    email: string,
    password: string
  }): Promise<AxiosResponse> => {
    try {
      return await apiClient.post('/auth/register', userData);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 사용자 정보 가져오기 API
  getUserProfile: async (): Promise<AxiosResponse> => {
    try {
      return await apiClient.get('/users/profile');
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 챌린지 관련 API
  challenges: {
    // 챌린지 생성
   // 챌린지 생성
create: async (challengeData: any): Promise<AxiosResponse> => {
  try {
    // 토큰 존재 확인
    if (!apiClient.defaults.headers.common['Authorization'] && globalToken) {
      console.log('API 호출 전 누락된 토큰 재설정');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${globalToken}`;
    }
    return await apiClient.post('/challenges', challengeData);
  } catch (error: any) {
    // 401 오류면 토큰 문제일 수 있음
    if (error.response && error.response.status === 401) {
      console.error('인증 오류 발생 - 토큰 확인 필요:', globalToken ? '토큰 있음' : '토큰 없음');
    }
    return Promise.reject(handleSafeError(error));
  }
},
    
    // 챌린지 목록 조회
    getAll: async (): Promise<AxiosResponse> => {
      try {
        return await apiClient.get('/challenges');
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 특정 챌린지 조회
    getById: async (id: number): Promise<AxiosResponse> => {
      try {
        return await apiClient.get(`/challenges/${id}`);
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 챌린지 업데이트
    update: async (id: number, data: any): Promise<AxiosResponse> => {
      try {
        return await apiClient.patch(`/challenges/${id}`, data);
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 챌린지 삭제
    delete: async (id: number): Promise<AxiosResponse> => {
      try {
        return await apiClient.delete(`/challenges/${id}`);
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 챌린지 참여
    join: async (id: number): Promise<AxiosResponse> => {
      try {
        return await apiClient.post(`/challenges/${id}/join`, {});
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 챌린지 감정 기록
    logEmotion: async (id: number, emotionData: any): Promise<AxiosResponse> => {
      try {
        return await apiClient.post(`/challenges/${id}/emotions`, emotionData);
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    }
  },
  
  // 감정 로그 관련 API
  emotions: {
    // 감정 로그 생성
    create: async (emotionData: any): Promise<AxiosResponse> => {
      try {
        return await apiClient.post('/emotions', emotionData);
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 감정 로그 목록 조회
    getAll: async (params?: any): Promise<AxiosResponse> => {
      try {
        return await apiClient.get('/emotions', { params });
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 특정 감정 로그 조회
    getById: async (id: number): Promise<AxiosResponse> => {
      try {
        return await apiClient.get(`/emotions/${id}`);
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 감정 로그 업데이트
    update: async (id: number, data: any): Promise<AxiosResponse> => {
      try {
        return await apiClient.patch(`/emotions/${id}`, data);
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 감정 로그 삭제
    delete: async (id: number): Promise<AxiosResponse> => {
      try {
        return await apiClient.delete(`/emotions/${id}`);
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    },
    
    // 감정 통계 조회
    getStats: async (): Promise<AxiosResponse> => {
      try {
        return await apiClient.get('/emotions/stats');
      } catch (error: any) {
        return Promise.reject(handleSafeError(error));
      }
    }
  },
    setAuthToken: (token: string): void => {
    setAuthToken(token); // 외부 함수 호출
  },
  // 나의 하루 게시물 관련 API
// 나의 하루 게시물 관련 API - 여러 가능한 경로 시도
myDay: {
  // 게시물 생성
  create: async (postData: any): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.post('/posts', postData);  // 일반적인 RESTful API 이름
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/posts)가 없어 다른 경로 시도');
          return await apiClient.post('/daily-posts', postData);  // 다른 가능한 경로
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 목록 조회
  getAll: async (): Promise<AxiosResponse> => {
    try {
      // 여러 가능한 경로 시도
      try {
        return await apiClient.get('/posts');  // 일반적인 RESTful API 이름
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 첫 번째 경로가 404면 다른 경로 시도
          console.log('첫 번째 경로(/posts)가 없어 다른 경로 시도');
          return await apiClient.get('/daily-posts');  // 다른 가능한 경로
        }
        throw error; // 404가 아닌 다른 오류라면 그대로 전달
      }
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 특정 게시물 조회
  getById: async (id: number): Promise<AxiosResponse> => {
    try {
      return await apiClient.get(`/posts/${id}`);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 업데이트
  update: async (id: number, data: any): Promise<AxiosResponse> => {
    try {
      return await apiClient.patch(`/posts/${id}`, data);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 삭제
  delete: async (id: number): Promise<AxiosResponse> => {
    try {
      return await apiClient.delete(`/posts/${id}`);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 좋아요
  like: async (id: number): Promise<AxiosResponse> => {
    try {
      return await apiClient.post(`/posts/${id}/like`, {});
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 댓글 작성
  addComment: async (id: number, commentData: any): Promise<AxiosResponse> => {
    try {
      return await apiClient.post(`/posts/${id}/comments`, commentData);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  
  // 게시물 댓글 조회
  getComments: async (id: number): Promise<AxiosResponse> => {
    try {
      return await apiClient.get(`/posts/${id}/comments`);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  }
}
};

// 간단한 API 요청 함수 (테스트용)
export const apiRequest = {
  get: async (url: string, config?: AxiosRequestConfig) => {
    try {
      return await apiClient.get(url, config);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  post: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    try {
      return await apiClient.post(url, data, config);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  put: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    try {
      return await apiClient.put(url, data, config);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  patch: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    try {
      return await apiClient.patch(url, data, config);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  },
  delete: async (url: string, config?: AxiosRequestConfig) => {
    try {
      return await apiClient.delete(url, config);
    } catch (error: any) {
      return Promise.reject(handleSafeError(error));
    }
  }
};
// apiClient 내보내기 추가 
export { apiClient };