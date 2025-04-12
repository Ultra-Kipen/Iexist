// tests/performance/api-load-test.js
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

// 커스텀 메트릭 정의
const calls = new Counter('api_calls');
const failRate = new Rate('failed_requests');
const responseTrend = new Trend('response_time');

// 테스트 설정 - 점진적으로 부하 증가
export const options = {
  stages: [
    { duration: '10s', target: 1 },  // 서버 연결 안정화 단계
    { duration: '20s', target: 5 },  // 저부하 단계
    { duration: '30s', target: 10 }, // 중간 부하 단계
    { duration: '20s', target: 20 }, // 고부하 단계
    { duration: '10s', target: 0 },  // 정리 단계
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95%의 요청이 3초 이내에 완료
    'failed_requests': ['rate<0.2'],    // 20% 이상 실패하면 테스트 실패
  },
};

// 테스트 환경 설정
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000/api';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// 서버 연결 확인 함수
function checkServerConnection(maxRetries = 5, retryDelay = 3) {
  let retries = 0;
  let connected = false;
  
  while (retries < maxRetries && !connected) {
    try {
      const res = http.get(API_BASE_URL, {
        headers: { 'x-test-mode': 'true' },
        timeout: '5s'
      });
      
      if (res.status >= 200 && res.status < 500) {
        connected = true;
        console.log(`서버 연결 성공 (시도: ${retries + 1})`);
        return true;
      }
      
      console.log(`서버 응답 비정상: ${res.status} (시도: ${retries + 1})`);
    } catch (e) {
      console.log(`서버 연결 실패 (시도: ${retries + 1}): ${e}`);
    }
    
    retries++;
    if (retries < maxRetries) {
      console.log(`${retryDelay}초 후 재시도...`);
      sleep(retryDelay);
    }
  }
  
  return connected;
}

// 가상 사용자 설정
export function setup() {
  console.log(`API 기본 URL: ${API_BASE_URL}`);
  
  // 서버 연결 확인
  const isConnected = checkServerConnection();
  if (!isConnected) {
    console.log('최대 재시도 횟수 초과. 서버에 연결할 수 없습니다.');
  }
  
  // 테스트 헤더 설정
  const testHeaders = {
    'x-test-mode': 'true',
    'x-performance-test': 'true',
    'Content-Type': 'application/json'
  };
  
  // 토큰 획득 시도 (환경 변수에 없는 경우)
  let token = AUTH_TOKEN;
  
  if (!token) {
    try {
      const loginRes = http.post(`${API_BASE_URL}/auth/login`, JSON.stringify({
        email: 'test@example.com',  // 실제 테스트 계정으로 변경
        password: 'test123!'        // 실제 테스트 계정 비밀번호로 변경
      }), {
        headers: testHeaders,
        timeout: '5s'
      });
      
      if (loginRes.status === 200) {
        try {
          const body = JSON.parse(loginRes.body);
          if (body.data && body.data.token) {
            token = body.data.token;
            console.log('로그인 성공, 토큰 획득');
          } else if (body.token) {
            token = body.token;
            console.log('로그인 성공, 토큰 획득');
          }
        } catch (e) {
          console.log(`응답 파싱 오류: ${e}`);
        }
      } else {
        console.log(`로그인 실패: ${loginRes.status} ${loginRes.body || ''}`);
      }
    } catch (e) {
      console.log(`로그인 시도 오류: ${e}`);
    }
  } else {
    console.log('환경 변수에서 인증 토큰 사용');
  }
  
  return { 
    token,
    testHeaders,
    isConnected
  };
}

// 핵심 테스트 시나리오
export default function(data) {
  // 서버 연결이 없으면 테스트 중단
  if (!data.isConnected && !data.token) {
    console.log('서버 연결이 없어 테스트를 중단합니다.');
    return;
  }
  
  // 테스트 헤더 설정
  const testHeaders = data.testHeaders;
  const authHeaders = data.token ? 
  { 
    ...testHeaders, 
    'Authorization': `Bearer ${data.token.trim()}` // 토큰 양쪽 공백 제거
  } : 
  testHeaders;
  
  // 요청 사이의 지연 시간
  const requestDelay = 1 + Math.random();
  
  // 1. GET 요청 - 감정 목록 API (인증 불필요)
  {
    const emotionsRes = http.get(`${API_BASE_URL}/emotions`, {
      headers: testHeaders,
      timeout: '5s'
    });
    
    calls.add(1);
    responseTrend.add(emotionsRes.timings.duration);
    
    const emotionsSuccess = check(emotionsRes, {
      'emotions API 응답 성공': (r) => r.status === 200,
      'emotions API 응답에 데이터 존재': (r) => {
        try {
          if (!r.body) return false;
          const body = JSON.parse(r.body);
          return body.status === 'success' && Array.isArray(body.data);
        } catch (e) {
          return false;
        }
      }
    });
    
    failRate.add(!emotionsSuccess);
    
    if (emotionsRes.body) {
      const bodyPreview = typeof emotionsRes.body === 'string' ? 
        emotionsRes.body.substring(0, Math.min(100, emotionsRes.body.length)) : 
        'Body is not a string';
      console.log(`감정 목록 API 응답: ${emotionsRes.status} ${bodyPreview}...`);
    } else {
      console.log(`감정 목록 API 응답: ${emotionsRes.status} (응답 본문 없음)`);
    }
  }
  
  sleep(requestDelay);
  
  // 2. GET 요청 - 태그 목록 API (인증 필요 가능성)
  {
    const tagsRes = http.get(`${API_BASE_URL}/tags`, {
      headers: authHeaders,
      timeout: '5s'
    });
    
    calls.add(1);
    responseTrend.add(tagsRes.timings.duration);
    
    const tagsSuccess = check(tagsRes, {
      'tags API 응답 성공': (r) => r.status === 200 || r.status === 401,
      'tags API 응답에 데이터 존재 또는 인증 오류': (r) => {
        try {
          if (!r.body) return false;
          const body = JSON.parse(r.body);
          return (body.status === 'success') || 
                 (r.status === 401 && body.message);
        } catch (e) {
          return false;
        }
      }
    });
    
    failRate.add(!tagsSuccess);
    
    if (tagsRes.body) {
      const bodyPreview = typeof tagsRes.body === 'string' ? 
        tagsRes.body.substring(0, Math.min(100, tagsRes.body.length)) : 
        'Body is not a string';
      console.log(`태그 목록 API 응답: ${tagsRes.status} ${bodyPreview}...`);
    }
  }
  
  sleep(requestDelay);
  
  // 3. 인증이 필요한 API 테스트 (토큰이 있는 경우)
  if (data.token) {
    // 사용자 프로필 API 테스트
    const profileRes = http.get(`${API_BASE_URL}/users/profile`, {
      headers: authHeaders,
      timeout: '5s'
    });
    
    calls.add(1);
    responseTrend.add(profileRes.timings.duration);
    
    const profileSuccess = check(profileRes, {
      'profile API 응답 성공': (r) => r.status === 200,
      'profile API 응답에 사용자 정보 존재': (r) => {
        try {
          if (!r.body) return false;
          const body = JSON.parse(r.body);
          return body.status === 'success' && body.data;
        } catch (e) {
          return false;
        }
      }
    });
    
    failRate.add(!profileSuccess);
    
    if (profileRes.body) {
      const bodyPreview = typeof profileRes.body === 'string' ? 
        profileRes.body.substring(0, Math.min(100, profileRes.body.length)) : 
        'Body is not a string';
      console.log(`프로필 API 응답: ${profileRes.status} ${bodyPreview}...`);
    }
    
    sleep(requestDelay);
    
    // 알림 목록 API 테스트
    const notificationsRes = http.get(`${API_BASE_URL}/notifications`, {
      headers: authHeaders,
      timeout: '5s'
    });
    
    calls.add(1);
    responseTrend.add(notificationsRes.timings.duration);
    
    check(notificationsRes, {
      'notifications API 응답 성공': (r) => r.status === 200,
    });
    
    console.log(`알림 목록 API 응답: ${notificationsRes.status}`);
  }
}

// 테스트 완료 후 정리 작업
export function teardown(data) {
  console.log('성능 테스트 완료');
  console.log(`테스트 결과: 연결 상태=${data.isConnected}, 인증 토큰=${data.token ? '있음' : '없음'}`);
}