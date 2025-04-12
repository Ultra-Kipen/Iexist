// __tests__/unit/services/emotionService.test.ts

import emotionService, { EmotionCreateDTO } from '../../../src/services/api/emotionService';
import apiClient from '../../../src/services/api/client';

// apiClient 모킹
jest.mock('../../../src/services/api/client', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

describe('Emotion Service Unit Tests', () => {
  // 각 테스트 전에 모킹 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEmotions', () => {
    it('should fetch all emotions', async () => {
      // 모의 데이터 설정
      const mockEmotions = {
        status: 'success',
        data: [
          { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
          { emotion_id: 2, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4' }
        ]
      };
      
      // 모의 응답 설정
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockEmotions });
      
      // 함수 호출 및 검증
      const result = await emotionService.getAllEmotions();
      
      expect(apiClient.get).toHaveBeenCalledWith('/emotions');
      expect(result.data).toEqual(mockEmotions);
    });

    it('should handle error when fetching emotions', async () => {
      // 모의 에러 설정
      const mockError = new Error('네트워크 오류');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);
      
      // 함수 호출 및 에러 검증
      await expect(emotionService.getAllEmotions()).rejects.toThrow('네트워크 오류');
    });
  });

  describe('recordEmotions', () => {
    it('should successfully record emotions', async () => {
      // 모의 데이터 설정
      const emotionData: EmotionCreateDTO = {
        emotion_ids: [1, 3],
        note: '오늘은 기분이 좋았어요.'
      };
      
      const mockResponse = {
        status: 'success',
        data: {
          log_id: 123,
          emotion_ids: [1, 3],
          note: '오늘은 기분이 좋았어요.',
          created_at: '2025-04-09T10:00:00Z'
        }
      };
      
      // 모의 응답 설정
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // 함수 호출 및 검증
      const result = await emotionService.recordEmotions(emotionData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/emotions', emotionData);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle error when recording emotions', async () => {
      // 모의 데이터 설정
      const emotionData: EmotionCreateDTO = {
        emotion_ids: []
      };
      
      // 모의 에러 설정
      const mockError = {
        response: {
          data: {
            status: 'error',
            message: '감정을 하나 이상 선택해주세요.'
          }
        }
      };
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);
      
      // 함수 호출 및 에러 검증
      await expect(emotionService.recordEmotions(emotionData)).rejects.toEqual(mockError);
    });
  });

  describe('getEmotionStats', () => {
    it('should fetch emotion stats with no parameters', async () => {
      // 모의 응답 설정
      const mockStats = {
        status: 'success',
        data: {
          total_logs: 30,
          emotions: [
            { emotion_id: 1, name: '행복', count: 15 },
            { emotion_id: 2, name: '슬픔', count: 5 }
          ]
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });
      
      // 함수 호출 및 검증
      const result = await emotionService.getEmotionStats();
      
      expect(apiClient.get).toHaveBeenCalledWith('/emotions/stats', { params: undefined });
      expect(result.data).toEqual(mockStats);
    });

    it('should fetch emotion stats with date parameters', async () => {
      // 날짜 파라미터 설정
      const params = {
        start_date: '2025-03-01',
        end_date: '2025-03-31'
      };
      
      // 모의 응답 설정
      const mockStats = {
        status: 'success',
        data: {
          total_logs: 10,
          emotions: [
            { emotion_id: 1, name: '행복', count: 7 },
            { emotion_id: 2, name: '슬픔', count: 3 }
          ]
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });
      
      // 함수 호출 및 검증
      const result = await emotionService.getEmotionStats(params);
      
      expect(apiClient.get).toHaveBeenCalledWith('/emotions/stats', { params });
      expect(result.data).toEqual(mockStats);
    });
  });

  describe('getEmotionTrends', () => {
    it('should fetch emotion trends with default parameters', async () => {
      // 모의 응답 설정
      const mockTrends = {
        status: 'success',
        data: {
          trends: [
            { date: '2025-04-01', emotions: [{ emotion_id: 1, count: 1 }] },
            { date: '2025-04-02', emotions: [{ emotion_id: 2, count: 1 }] }
          ]
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTrends });
      
      // 함수 호출 및 검증
      const result = await emotionService.getEmotionTrends();
      
      expect(apiClient.get).toHaveBeenCalledWith('/stats/trends', { params: undefined });
      expect(result.data).toEqual(mockTrends);
    });

    it('should fetch emotion trends with custom parameters', async () => {
      // 파라미터 설정
      const params = {
        start_date: '2025-01-01',
        end_date: '2025-03-31',
        type: 'month' as const
      };
      
      // 모의 응답 설정
      const mockTrends = {
        status: 'success',
        data: {
          trends: [
            { date: '2025-01', emotions: [{ emotion_id: 1, count: 10 }] },
            { date: '2025-02', emotions: [{ emotion_id: 2, count: 12 }] },
            { date: '2025-03', emotions: [{ emotion_id: 1, count: 8 }] }
          ]
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTrends });
      
      // 함수 호출 및 검증
      const result = await emotionService.getEmotionTrends(params);
      
      expect(apiClient.get).toHaveBeenCalledWith('/stats/trends', { params });
      expect(result.data).toEqual(mockTrends);
    });
  });

  describe('getDailyEmotionCheck', () => {
    it('should fetch daily emotion check status', async () => {
      // 모의 응답 설정
      const mockResponse = {
        status: 'success',
        data: {
          has_checked: true,
          last_check: '2025-04-09T08:30:00Z',
          emotions: [
            { emotion_id: 1, name: '행복' }
          ]
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // 함수 호출 및 검증
      const result = await emotionService.getDailyEmotionCheck();
      
      expect(apiClient.get).toHaveBeenCalledWith('/emotions/daily-check');
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle the case when no daily check exists', async () => {
      // 모의 응답 설정
      const mockResponse = {
        status: 'success',
        data: {
          has_checked: false
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });
      
      // 함수 호출 및 검증
      const result = await emotionService.getDailyEmotionCheck();
      
      expect(apiClient.get).toHaveBeenCalledWith('/emotions/daily-check');
      expect(result.data).toEqual(mockResponse);
    });
  });
});