import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig, 
  AxiosRequestHeaders 
} from 'axios';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json',
    } as AxiosRequestHeaders,
  });

  // 환경에 따라 인터셉터 추가
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // headers가 존재하지 않을 경우 초기화
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }

      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('auth_token') 
        : null;

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return client;
};

const apiClient = createApiClient();


export interface ProfileUpdateData {
  nickname?: string;
  profile_image_url?: string;
  background_image_url?: string;
  favorite_quote?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  privacy_settings?: {
    show_profile?: boolean;
    show_emotions?: boolean;
    show_posts?: boolean;
    show_challenges?: boolean;
  };
}

export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  nickname?: string;
  profile_image_url?: string;
  background_image_url?: string;
  favorite_quote?: string;
  theme_preference: 'light' | 'dark' | 'system';
  privacy_settings: {
    show_profile: boolean;
    show_emotions: boolean;
    show_posts: boolean;
    show_challenges: boolean;
  };
  last_login_at: string;
  created_at: string;
}

export interface UserStats {
  my_day_post_count: number;
  someone_day_post_count: number;
  my_day_like_received_count: number;
  someone_day_like_received_count: number;
  my_day_comment_received_count: number;
  someone_day_comment_received_count: number;
  challenge_count: number;
  last_updated: string;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}

const userService = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>('/users/profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || { 
          status: 'error', 
          message: '프로필 정보 조회에 실패했습니다.' 
        };
      }
      throw error;
    }
  },
  
  updateProfile: async (data: ProfileUpdateData): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.put<ApiResponse<void>>('/users/profile', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || { 
          status: 'error', 
          message: '프로필 업데이트에 실패했습니다.' 
        };
      }
      throw error;
    }
  },
  
  getUserById: async (userId: number): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || { 
          status: 'error', 
          message: '사용자 정보를 찾을 수 없습니다.' 
        };
      }
      throw error;
    }
  },
  
  getUserStats: async (): Promise<ApiResponse<UserStats>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>('/users/stats');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || { 
          status: 'error', 
          message: '사용자 통계 정보를 가져올 수 없습니다.' 
        };
      }
      throw error;
    }
  },
  
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.put<ApiResponse<void>>('/users/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || { 
          status: 'error', 
          message: '비밀번호 변경에 실패했습니다.' 
        };
      }
      throw error;
    }
  },
  
  blockUser: async (userId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/users/block/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || { 
          status: 'error', 
          message: '사용자 차단에 실패했습니다.' 
        };
      }
      throw error;
    }
  },
  
  unblockUser: async (userId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/users/block/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || { 
          status: 'error', 
          message: '사용자 차단 해제에 실패했습니다.' 
        };
      }
      throw error;
    }
  },
  
  getBlockedUsers: async (): Promise<ApiResponse<UserProfile[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile[]>>('/users/blocked');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || { 
          status: 'error', 
          message: '차단된 사용자 목록을 가져올 수 없습니다.' 
        };
      }
      throw error;
    }
  }
};

export { apiClient, createApiClient };
export default userService;