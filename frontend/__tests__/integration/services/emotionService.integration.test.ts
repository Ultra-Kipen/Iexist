// __tests__/integration/services/emotionService.integration.test.ts

import emotionService, { EmotionCreateDTO } from '../../../src/services/api/emotionService';
import apiClient from '../../../src/services/api/client';

// apiClient 모킹
jest.mock('../../../src/services/api/client', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

describe('Emotion Service Integration Tests', () => {
  // 각 테스트 전에 모킹 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEmotions and recordEmotions integration', () => {
    it('should fetch emotions and then record them', async () => {
      // getAllEmotions 모의 응답 설정
      const mockEmotions = {
        status: 'success',
        data: [
          { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
          { emotion_id: 2, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4' }
        ]
      };
      
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockEmotions });
      
      // recordEmotions 모의 응답 설정
      const mockRecordResponse = {
        status: 'success',
        data: {
          log_id: 123,
          emotion_ids: [1],
          created_at: '2025-04-09T10:00:00Z'
        }
      };
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockRecordResponse });
      
      // 테스트 실행 - 먼저 감정 목록 가져오기
      const emotionsResult = await emotionService.getAllEmotions();
      
      // 첫 번째 감정 선택하여 기록
      const emotionData: EmotionCreateDTO = {
        emotion_ids: [emotionsResult.data.data[0].emotion_id]
      };
      
      const recordResult = await emotionService.recordEmotions(emotionData);
      
      // 검증
      expect(apiClient.get).toHaveBeenCalledWith('/emotions');
      expect(apiClient.post).toHaveBeenCalledWith('/emotions', emotionData);
      expect(emotionsResult.data).toEqual(mockEmotions);
      expect(recordResult.data).toEqual(mockRecordResponse);
    });
  });

  describe('getEmotionStats and getEmotionTrends integration', () => {
    it('should fetch both stats and trends for the same period', async () => {
      // 날짜 파라미터 설정
      const params = {
        start_date: '2025-03-01',
        end_date: '2025-03-31'
      };
      
      // getEmotionStats 모의 응답 설정
      const mockStats = {
        status: 'success',
        data: {
          total_logs: 20,
          emotions: [
            { emotion_id: 1, name: '행복', count: 12 },
            { emotion_id: 2, name: '슬픔', count: 8 }
          ]
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockStats });
      
      // getEmotionTrends 모의 응답 설정
      const mockTrends = {
        status: 'success',
        data: {
          trends: [
            { date: '2025-03-01', emotions: [{ emotion_id: 1, count: 1 }] },
            { date: '2025-03-15', emotions: [{ emotion_id: 2, count: 1 }] },
            { date: '2025-03-30', emotions: [{ emotion_id: 1, count: 1 }] }
          ]
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockTrends });
      
      // 테스트 실행
      const statsResult = await emotionService.getEmotionStats(params);
      const trendsResult = await emotionService.getEmotionTrends({
        ...params,
        type: 'day'
      });
      
      // 검증
      expect(apiClient.get).toHaveBeenNthCalledWith(1, '/emotions/stats', { params });
      expect(apiClient.get).toHaveBeenNthCalledWith(2, '/stats/trends', { 
        params: { ...params, type: 'day' } 
      });
      
      expect(statsResult.data).toEqual(mockStats);
      expect(trendsResult.data).toEqual(mockTrends);
    });
  });

  describe('getDailyEmotionCheck and recordEmotions integration', () => {
    it('should check daily status and record emotions if not checked yet', async () => {
      // getDailyEmotionCheck 모의 응답 설정 - 아직 체크하지 않음
      const mockCheckResponse = {
        status: 'success',
        data: {
          has_checked: false
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockCheckResponse });
      
      // recordEmotions 모의 응답 설정
      const mockRecordResponse = {
        status: 'success',
        data: {
          log_id: 123,
          emotion_ids: [1, 2],
          note: '오늘 감정 기록',
          created_at: '2025-04-09T10:00:00Z'
        }
      };
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockRecordResponse });
      
      // getDailyEmotionCheck 모의 응답 설정 - 두 번째 호출 (체크 후)
      const mockCheckAfterResponse = {
        status: 'success',
        data: {
          has_checked: true,
          last_check: '2025-04-09T10:00:00Z',
          emotions: [
            { emotion_id: 1, name: '행복' },
            { emotion_id: 2, name: '슬픔' }
          ]
        }
      };
      
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockCheckAfterResponse });
      
      // 테스트 실행 - 먼저 오늘 이미 체크했는지 확인
      const checkResult = await emotionService.getDailyEmotionCheck();
      
      // 체크하지 않았다면 감정 기록
      let secondCheckResult = null;
      if (!checkResult.data.data.has_checked) {
        const emotionData: EmotionCreateDTO = {
          emotion_ids: [1, 2],
          note: '오늘 감정 기록'
        };
        
        await emotionService.recordEmotions(emotionData);
        
        // 기록 후 다시 체크 상태 확인
        secondCheckResult = await emotionService.getDailyEmotionCheck();
      }
      
      // 검증
      expect(apiClient.get).toHaveBeenNthCalledWith(1, '/emotions/daily-check');
      expect(apiClient.post).toHaveBeenCalledWith('/emotions', {
        emotion_ids: [1, 2],
        note: '오늘 감정 기록'
      });
      expect(apiClient.get).toHaveBeenNthCalledWith(2, '/emotions/daily-check');
      
      expect(checkResult.data).toEqual(mockCheckResponse);
      expect(secondCheckResult?.data).toEqual(mockCheckAfterResponse);
    });
  });
});