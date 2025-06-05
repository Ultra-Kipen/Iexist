// __tests__/unit/services/api/goalService.test.ts - 추가 내용

import apiClient from '../../../../src/services/api/client';
import goalService, { GoalCreateData } from '../../../../src/services/api/goalService';

// apiClient 모킹
jest.mock('../../../../src/services/api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

describe('goalService 기본 기능 테스트', () => {
  beforeEach(() => {
    // 모든 모킹 함수 초기화
    jest.clearAllMocks();
  });

  describe('getGoals', () => {
    it('활성 목표만 조회할 수 있음', async () => {
      const mockResponse = { 
        data: { 
          status: 'success', 
          data: [{ goal_id: 1, progress: 50 }] 
        } 
      };
      
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await goalService.getGoals({ active_only: true });
      
      expect(apiClient.get).toHaveBeenCalledWith('/goals', { 
        params: { active_only: true } 
      });
      expect(result).toEqual(mockResponse);
    });

    it('페이징을 사용해 목표를 조회할 수 있음', async () => {
      const mockResponse = { 
        data: { 
          status: 'success', 
          data: [{ goal_id: 1 }, { goal_id: 2 }],
          pagination: { total: 10, page: 1, limit: 2 }
        } 
      };
      
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await goalService.getGoals({ page: 1, limit: 2 });
      
      expect(apiClient.get).toHaveBeenCalledWith('/goals', { 
        params: { page: 1, limit: 2 } 
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createGoal', () => {
    it('새 목표를 생성할 수 있음', async () => {
      const newGoal: GoalCreateData = {
        target_emotion_id: 1,
        start_date: '2025-05-01',
        end_date: '2025-05-31'
      };
      
      const mockResponse = { 
        data: { 
          status: 'success', 
          data: {
            goal_id: 1,
            user_id: 100,
            ...newGoal,
            emotion_name: '행복',
            emotion_color: '#FFD700',
            progress: 0,
            created_at: '2025-04-26T10:00:00Z',
            updated_at: '2025-04-26T10:00:00Z'
          }
        } 
      };
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await goalService.createGoal(newGoal);
      
      expect(apiClient.post).toHaveBeenCalledWith('/goals', newGoal);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateGoalProgress', () => {
    it('목표 진행 상황을 업데이트할 수 있음', async () => {
      const goalId = 1;
      const progress = 75;
      
      const mockResponse = { 
        data: { 
          status: 'success', 
          message: '목표 진행 상황이 업데이트되었습니다' 
        } 
      };
      
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await goalService.updateGoalProgress(goalId, progress);
      
      expect(apiClient.put).toHaveBeenCalledWith(
        `/goals/${goalId}/progress`, 
        { progress }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteGoal', () => {
    it('목표를 삭제할 수 있음', async () => {
      const goalId = 1;
      
      const mockResponse = { 
        data: { 
          status: 'success', 
          message: '목표가 삭제되었습니다' 
        } 
      };
      
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await goalService.deleteGoal(goalId);
      
      expect(apiClient.delete).toHaveBeenCalledWith(`/goals/${goalId}`);
      expect(result).toEqual(mockResponse);
    });
  });
});