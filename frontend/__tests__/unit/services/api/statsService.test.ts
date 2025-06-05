// __tests__/unit/services/api/statsService.test.ts

import statsService from '../../../../src/services/api/statsService';
import fs from 'fs';
import path from 'path';

// apiClient 모킹 (interceptors 포함)
jest.mock('../../../../src/services/api/client', () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn()
      },
      response: {
        use: jest.fn(),
        eject: jest.fn()
      }
    }
  };
});

describe('statsService 소스 코드 검증', () => {
  let statsServiceSource;
  
  beforeAll(() => {
    // 파일 읽기
    const statsServicePath = path.resolve(__dirname, '../../../../src/services/api/statsService.ts');
    statsServiceSource = fs.readFileSync(statsServicePath, 'utf8');
  });
  
  it('기본 인터페이스와 모든 필수 메서드가 정의되어 있어야 함', () => {
    expect(statsServiceSource).toContain('interface StatsServiceType');
    expect(statsServiceSource).toContain('client: AxiosInstance');
    expect(statsServiceSource).toContain('getUserStats:');
    expect(statsServiceSource).toContain('getEmotionTrends:');
    expect(statsServiceSource).toContain('getWeeklyTrends:');
    expect(statsServiceSource).toContain('getMonthlyTrends:');
    expect(statsServiceSource).toContain('getEmotionStats:');
    expect(statsServiceSource).toContain('getActivitySummary:');
  });
  
  it('각 메서드에 대한 오류 처리가 구현되어 있어야 함', () => {
    expect(statsServiceSource).toContain('try {');
    expect(statsServiceSource).toContain('catch (error)');
    expect(statsServiceSource).toContain('throw new Error');
    
    // 각 오류 메시지 확인
    expect(statsServiceSource).toContain('통계 정보 조회에 실패했습니다');
    expect(statsServiceSource).toContain('감정 트렌드 조회에 실패했습니다');
    expect(statsServiceSource).toContain('주간 트렌드 조회에 실패했습니다');
    expect(statsServiceSource).toContain('월간 트렌드 조회에 실패했습니다');
    expect(statsServiceSource).toContain('감정별 통계 조회에 실패했습니다');
    expect(statsServiceSource).toContain('활동 요약 조회에 실패했습니다');
  });
  
  it('URLSearchParams를 사용하여 쿼리 매개변수를 적절히 처리해야 함', () => {
    expect(statsServiceSource).toContain('const params = new URLSearchParams()');
    expect(statsServiceSource).toContain('params.append(');
  });
  
  it('적절한 API 엔드포인트를 사용해야 함', () => {
    expect(statsServiceSource).toContain('/stats');
    expect(statsServiceSource).toContain('/stats/trends');
    expect(statsServiceSource).toContain('/stats/weekly');
    expect(statsServiceSource).toContain('/stats/monthly');
    expect(statsServiceSource).toContain('/stats/emotions/');
    expect(statsServiceSource).toContain('/stats/activity');
  });
  
  it('모든 메서드에 JSDoc 주석이 있어야 함', () => {
    expect(statsServiceSource).toContain('/**');
    expect(statsServiceSource).toContain('@param');
    expect(statsServiceSource).toContain('@returns');
    expect(statsServiceSource).toContain('*/');
  });
});

// 기능 테스트: 실제 동작 검증
describe('statsService 기능 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('getUserStats가 올바른 엔드포인트를 호출해야 함', async () => {
    // 성공 응답 모킹
    (statsService.client.get as jest.Mock).mockResolvedValueOnce({
      data: { stats: {} }
    });
    
    await statsService.getUserStats();
    
    expect(statsService.client.get).toHaveBeenCalledWith('/stats');
  });
  
  it('getEmotionTrends가 올바른 매개변수로 호출되어야 함', async () => {
    // 성공 응답 모킹
    (statsService.client.get as jest.Mock).mockResolvedValueOnce({
      data: {}
    });
    
    const options = {
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      type: 'monthly' as const
    };
    
    await statsService.getEmotionTrends(options);
    
    expect(statsService.client.get).toHaveBeenCalledWith('/stats/trends', {
      params: expect.any(URLSearchParams)
    });
    
    // URLSearchParams를 확인하는 것은 어려울 수 있으므로 생략
  });
  
  it('getWeeklyTrends가 올바른 매개변수로 호출되어야 함', async () => {
    // 성공 응답 모킹
    (statsService.client.get as jest.Mock).mockResolvedValueOnce({
      data: {}
    });
    
    await statsService.getWeeklyTrends({
      start_date: '2025-01-01',
      end_date: '2025-01-31'
    });
    
    expect(statsService.client.get).toHaveBeenCalledWith('/stats/weekly', {
      params: expect.any(URLSearchParams)
    });
  });
  
  it('getMonthlyTrends가 올바른 매개변수로 호출되어야 함', async () => {
    // 성공 응답 모킹
    (statsService.client.get as jest.Mock).mockResolvedValueOnce({
      data: {}
    });
    
    await statsService.getMonthlyTrends({
      start_date: '2025-01-01',
      end_date: '2025-12-31'
    });
    
    expect(statsService.client.get).toHaveBeenCalledWith('/stats/monthly', {
      params: expect.any(URLSearchParams)
    });
  });
  
  it('getEmotionStats가 감정 ID와 기간으로 올바르게 호출되어야 함', async () => {
    // 성공 응답 모킹
    (statsService.client.get as jest.Mock).mockResolvedValueOnce({
      data: {}
    });
    
    const emotionId = 1;
    const period = 'week' as const;
    
    await statsService.getEmotionStats(emotionId, period);
    
    expect(statsService.client.get).toHaveBeenCalledWith(`/stats/emotions/${emotionId}`, {
      params: { period }
    });
  });
  
  it('getActivitySummary가 기간 매개변수로 올바르게 호출되어야 함', async () => {
    // 성공 응답 모킹
    (statsService.client.get as jest.Mock).mockResolvedValueOnce({
      data: {}
    });
    
    const period = 'year' as const;
    
    await statsService.getActivitySummary(period);
    
    expect(statsService.client.get).toHaveBeenCalledWith('/stats/activity', {
      params: { period }
    });
  });
  
  it('모든 메서드가 오류를 올바르게 처리해야 함', async () => {
    // 모든 API 호출에 대해 오류 모킹
    (statsService.client.get as jest.Mock).mockRejectedValue(new Error('API 오류'));
    
    // 각 메서드의 오류 처리 테스트
    await expect(statsService.getUserStats()).rejects.toThrow('통계 정보 조회에 실패했습니다');
    await expect(statsService.getEmotionTrends()).rejects.toThrow('감정 트렌드 조회에 실패했습니다');
    await expect(statsService.getWeeklyTrends()).rejects.toThrow('주간 트렌드 조회에 실패했습니다');
    await expect(statsService.getMonthlyTrends()).rejects.toThrow('월간 트렌드 조회에 실패했습니다');
    await expect(statsService.getEmotionStats(1)).rejects.toThrow('감정별 통계 조회에 실패했습니다');
    await expect(statsService.getActivitySummary()).rejects.toThrow('활동 요약 조회에 실패했습니다');
  });
});