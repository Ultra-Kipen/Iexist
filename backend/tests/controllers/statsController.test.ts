import { createTestUser, testRequest } from '../setup';
import db from '../../models';

describe('Stats Controller', () => {
  let token: string;
  let userId: number;

  beforeEach(async () => {
    // 테스트 사용자 생성 및 토큰 획득
    try {
      const testUser = await createTestUser();
      token = testUser.token;
      userId = testUser.userId;
    } catch (error) {
      console.error('테스트 사용자 생성 오류:', error);
      throw error;
    }
  });

  describe('GET /api/stats', () => {
    it('인증된 사용자는 자신의 통계를 조회할 수 있다', async () => {
      // 응답 확인
      const response = await testRequest
        .get('/api/stats')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('인증되지 않은 요청은 401 에러를 반환한다', async () => {
      const response = await testRequest.get('/api/stats');
      
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('인증이 필요합니다.');
    });
  });

  describe('GET /api/stats/trends', () => {
    it('인증된 사용자는 감정 트렌드를 조회할 수 있다', async () => {
      // EmotionLog 모델의 필드 구조에 맞게 데이터 생성
      // 감정 로그 생성은 건너뛰고 바로 API 호출만 테스트
      const response = await testRequest
        .get('/api/stats/trends')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('trends');
      expect(response.body.data).toHaveProperty('period');
    });

    it('인증되지 않은 요청은 401 에러를 반환한다', async () => {
      const response = await testRequest.get('/api/stats/trends');
      
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('인증이 필요합니다.');
    });

    it('유효한 날짜 범위로 필터링할 수 있다', async () => {
      // 일주일 전 날짜
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // 어제 날짜
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 오늘 날짜
      const today = new Date();

      // 날짜 포맷 함수
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      // 어제부터 오늘까지 필터링
      const response = await testRequest
        .get(`/api/stats/trends?start_date=${formatDate(yesterday)}&end_date=${formatDate(today)}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /api/stats/weekly', () => {
    it('인증된 사용자는 주간 감정 트렌드를 조회할 수 있다', async () => {
      const response = await testRequest
        .get('/api/stats/weekly')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.period.type).toBe('weekly');
    });
  });

  describe('GET /api/stats/monthly', () => {
    it('인증된 사용자는 월간 감정 트렌드를 조회할 수 있다', async () => {
      const response = await testRequest
        .get('/api/stats/monthly')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.period.type).toBe('monthly');
    });
  });
});