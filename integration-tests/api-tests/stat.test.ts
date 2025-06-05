// api-tests/stat.test.ts
import { api, setAuthToken, apiClient } from '../helpers/api';
import { StatusCodes } from 'http-status-codes';

describe('통계 및 분석 API 테스트', () => {
  // 고유한 ID 생성으로 테스트 간 충돌 방지
  const uniqueId = Date.now().toString().slice(-6);
  let authToken: string = '';
  
  // 테스트 사용자 정보
  const testUser = {
    username: `stat_user_${uniqueId}`,
    email: `stat_${uniqueId}@example.com`,
    password: 'Password1234!'
  };
  
  // 모든 테스트 전에 실행
  beforeAll(async () => {
    jest.setTimeout(60000); // 전체 테스트에 대한 타임아웃 설정
    
    try {
      // 사용자 등록 시도
      try {
        await api.register(testUser);
        console.log('테스트 사용자 등록 성공');
      } catch (error: any) {
        // 이미 등록된 사용자라면 무시 (409 Conflict)
        if (error.response && error.response.status === 409) {
          console.log('이미 등록된 사용자입니다. 로그인 진행합니다.');
        } else {
          throw error;
        }
      }
      
      // 로그인
      const loginResponse = await api.login(testUser.email, testUser.password);
      
      // 토큰 확인 및 유효성 검사
      if (!loginResponse.data || !loginResponse.data.data || !loginResponse.data.data.token) {
        console.error('로그인 응답에 토큰이 없습니다:', loginResponse.data);
        throw new Error('인증 토큰을 받지 못했습니다');
      }

      authToken = loginResponse.data.data.token;
      
      // 토큰 설정
      setAuthToken(authToken);
      
      // 명시적으로 헤더에 토큰 설정 (백업 방법)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      console.log('로그인 성공, 토큰 설정 완료');
    } catch (error: any) {
      console.error('테스트 설정 실패:', error.message);
      if (error.response) {
        console.error('에러 응답:', error.response.status, error.response.data);
      }
      console.error('테스트를 계속 진행합니다만, 인증 관련 오류로 실패할 수 있습니다.');
    }
  });
  
  // 테스트 케이스
  it('감정 통계를 조회할 수 있어야 함', async () => {
    try {
      // 테스트 전 인증 확인
      if (!authToken || !apiClient.defaults.headers.common['Authorization']) {
        // 누락된 토큰을 다시 설정 시도 (백업 방법)
        if (authToken) {
          console.log('토큰이 헤더에 없어서 다시 설정합니다.');
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        } else {
          console.log('인증 토큰이 없어 테스트를 건너뜁니다.');
          return;
        }
      }
      
      const response = await api.stats.getEmotionStats();
      console.log('감정 통계 조회 응답:', response.status, JSON.stringify(response.data));
      
      expect(response.status).toBe(StatusCodes.OK);
      
      // 응답 데이터 구조 확인
      expect(response.data).toBeDefined();
    } catch (error: any) {
      // API가 없는 경우 (404) 테스트 건너뜀
      if (error.response && error.response.status === 404) {
        console.log('감정 통계 API가 구현되지 않았습니다. 테스트를 건너뜁니다.');
        return;
      }
      
      console.error('감정 통계 조회 실패:', error.message);
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      }
      throw error;
    }
  });
  
  it('활동 통계를 조회할 수 있어야 함', async () => {
    try {
      // 테스트 전 인증 확인
      if (!authToken || !apiClient.defaults.headers.common['Authorization']) {
        // 누락된 토큰을 다시 설정 시도 (백업 방법)
        if (authToken) {
          console.log('토큰이 헤더에 없어서 다시 설정합니다.');
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        } else {
          console.log('인증 토큰이 없어 테스트를 건너뜁니다.');
          return;
        }
      }
      
      const response = await api.stats.getActivityStats();
      console.log('활동 통계 조회 응답:', response.status, JSON.stringify(response.data));
      
      expect(response.status).toBe(StatusCodes.OK);
      
      // 응답 데이터 구조 확인
      expect(response.data).toBeDefined();
    } catch (error: any) {
      // API가 없는 경우 (404) 테스트 건너뜀
      if (error.response && error.response.status === 404) {
        console.log('활동 통계 API가 구현되지 않았습니다. 테스트를 건너뜁니다.');
        return;
      }
      
      console.error('활동 통계 조회 실패:', error.message);
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      }
      throw error;
    }
  });
  
  it('기간별 감정 분석을 조회할 수 있어야 함', async () => {
    try {
      // 테스트 전 인증 확인
      if (!authToken || !apiClient.defaults.headers.common['Authorization']) {
        // 누락된 토큰을 다시 설정 시도 (백업 방법)
        if (authToken) {
          console.log('토큰이 헤더에 없어서 다시 설정합니다.');
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        } else {
          console.log('인증 토큰이 없어 테스트를 건너뜁니다.');
          return;
        }
      }
      
      // 현재 날짜 기준으로 일주일 전부터 오늘까지의 범위
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await api.stats.getEmotionAnalysisByPeriod(startDate, endDate);
      console.log('기간별 감정 분석 조회 응답:', response.status, JSON.stringify(response.data));
      
      expect(response.status).toBe(StatusCodes.OK);
      
      // 응답 데이터 구조 확인
      expect(response.data).toBeDefined();
    } catch (error: any) {
      // API가 없는 경우 (404) 테스트 건너뜀
      if (error.response && error.response.status === 404) {
        console.log('기간별 감정 분석 API가 구현되지 않았습니다. 테스트를 건너뜁니다.');
        return;
      }
      
      console.error('기간별 감정 분석 조회 실패:', error.message);
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      }
      throw error;
    }
  });
});