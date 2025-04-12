// services/api/statsService.ts
import client from './client';

/**
 * 사용자 통계 API 서비스
 */
const statsService = {
  /**
   * 사용자 통계 조회
   * @returns 사용자 통계 정보
   */
  getUserStats: async () => {
    return client.get('/stats');
  },

  /**
   * 감정 트렌드 조회
   * @param options 옵션 (시작날짜, 종료날짜, 트렌드 타입)
   * @returns 감정 트렌드 데이터
   */
  getEmotionTrends: async (options?: {
    start_date?: string;
    end_date?: string;
    type?: 'daily' | 'weekly' | 'monthly';
  }) => {
    const params = new URLSearchParams();
    
    if (options?.start_date) {
      params.append('start_date', options.start_date);
    }
    
    if (options?.end_date) {
      params.append('end_date', options.end_date);
    }
    
    if (options?.type) {
      params.append('type', options.type);
    }
    
    return client.get('/stats/trends', { params });
  },

  /**
   * 주간 감정 트렌드 조회
   * @param options 옵션 (시작날짜, 종료날짜)
   * @returns 주간 감정 트렌드 데이터
   */
  getWeeklyTrends: async (options?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const params = new URLSearchParams();
    
    if (options?.start_date) {
      params.append('start_date', options.start_date);
    }
    
    if (options?.end_date) {
      params.append('end_date', options.end_date);
    }
    
    return client.get('/stats/weekly', { params });
  },

  /**
   * 월간 감정 트렌드 조회
   * @param options 옵션 (시작날짜, 종료날짜)
   * @returns 월간 감정 트렌드 데이터
   */
  getMonthlyTrends: async (options?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const params = new URLSearchParams();
    
    if (options?.start_date) {
      params.append('start_date', options.start_date);
    }
    
    if (options?.end_date) {
      params.append('end_date', options.end_date);
    }
    
    return client.get('/stats/monthly', { params });
  },
  
  /**
   * 감정별 통계 조회
   * @param emotionId 감정 ID
   * @param period 기간 (주간, 월간, 연간)
   * @returns 감정별 통계 데이터
   */
  getEmotionStats: async (emotionId: number, period: 'week' | 'month' | 'year' = 'month') => {
    return client.get(`/stats/emotions/${emotionId}`, {
      params: { period }
    });
  },
  
  /**
   * 활동 요약 통계 조회
   * @param period 기간 (주간, 월간, 연간)
   * @returns 활동 요약 통계 데이터
   */
  getActivitySummary: async (period: 'week' | 'month' | 'year' = 'month') => {
    return client.get('/stats/activity', {
      params: { period }
    });
  }
};

export default statsService;