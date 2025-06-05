// integration-tests/load-tests/load-test.ts
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// 메트릭 정의
const errors = new Counter('errors');
const timeouts = new Counter('timeouts');
const successRate = new Rate('success_rate');

// 테스트 구성
export const options = {
  // 가상 사용자(VU) 및 단계 구성
  stages: [
    { duration: '30s', target: 20 },  // 30초 동안 20명의 사용자로 증가
    { duration: '1m', target: 20 },   // 1분 동안 20명의 사용자 유지
    { duration: '30s', target: 50 },  // 30초 동안 50명의 사용자로 증가
    { duration: '1m', target: 50 },   // 1분 동안 50명의 사용자 유지
    { duration: '30s', target: 0 },   // 30초 동안 0명의 사용자로 감소 (점진적 종료)
  ],
  thresholds: {
    // 임계값 설정
    http_req_duration: ['p(95)<500'], // 요청의 95%가 500ms 이내에 완료되어야 함
    'success_rate': ['rate>0.95'],    // 성공률 95% 이상 유지해야 함
  },
};

// 기본 API URL 및 인증 헤더
const BASE_URL = 'http://localhost:3000/api';

// 인터페이스 정의
interface User {
  username: string;
  email: string;
  password: string;
}

interface Challenge {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
}

interface EmotionLog {
  emotion_id: number;
  log_date: string;
  note: string;
}

// 테스트용 사용자 정보 생성
function getRandomUser(): User {
  const id = Math.floor(Math.random() * 100000);
  return {
    username: `loadtest_${id}`,
    email: `loadtest_${id}@example.com`,
    password: 'Password1234!'
  };
}

// 테스트용 챌린지 정보 생성
function getRandomChallenge(): Challenge {
  const id = Math.floor(Math.random() * 100000);
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);
  
  return {
    title: `Load Test Challenge ${id}`,
    description: `This is a challenge created for load testing purposes ${id}`,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    is_public: true
  };
}

// 메인 테스트 함수
export default function() {
  // 테스트 사용자 생성 (매 테스트 반복마다 새 사용자)
  const user = getRandomUser();
  
  // 1. 사용자 등록 테스트
  let registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '10s',
  });
  
  let success = check(registerRes, {
    'register status is 201 or 409 (already exists)': (r) => r.status === 201 || r.status === 409,
  });
  successRate.add(success);
  if (!success) {
    errors.add(1);
    console.log(`사용자 등록 실패: ${registerRes.status} - ${registerRes.body}`);
  }
  
  // 2. 로그인 테스트
  let loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password
  }), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '10s',
  });
  
  success = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'token is present': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.token;
      } catch (e) {
        return false;
      }
    },
  });
  successRate.add(success);
  
  if (!success) {
    errors.add(1);
    console.log(`로그인 실패: ${loginRes.status} - ${loginRes.body}`);
    // 로그인 실패 시 이후 테스트 건너뛰기
    return;
  }
  
  // 로그인 성공 시 토큰 추출
  const token = JSON.parse(loginRes.body).data.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  // 3. 챌린지 생성 테스트
  const challenge = getRandomChallenge();
  let challengeRes = http.post(`${BASE_URL}/challenges`, JSON.stringify(challenge), {
    headers: headers,
    timeout: '10s',
  });
  
  success = check(challengeRes, {
    'challenge creation status is 201': (r) => r.status === 201,
  });
  successRate.add(success);
  
  if (!success) {
    errors.add(1);
    console.log(`챌린지 생성 실패: ${challengeRes.status} - ${challengeRes.body}`);
  } else {
    // 챌린지 ID 추출
    let challengeId: number | undefined;
    try {
      const response = JSON.parse(challengeRes.body);
      challengeId = response.data?.challenge_id || response.challenge_id;
      
      if (challengeId) {
        // 4. 챌린지 세부 정보 조회
        let getRes = http.get(`${BASE_URL}/challenges/${challengeId}`, {
          headers: headers,
          timeout: '10s',
        });
        
        success = check(getRes, {
          'get challenge status is 200': (r) => r.status === 200,
        });
        successRate.add(success);
        
        if (!success) {
          errors.add(1);
          console.log(`챌린지 조회 실패: ${getRes.status} - ${getRes.body}`);
        }
        
        // 5. 챌린지 참여 테스트
        let joinRes = http.post(`${BASE_URL}/challenges/${challengeId}/join`, {}, {
          headers: headers,
          timeout: '10s',
        });
        
        success = check(joinRes, {
          'join challenge status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        });
        successRate.add(success);
        
        if (!success) {
          errors.add(1);
          console.log(`챌린지 참여 실패: ${joinRes.status} - ${joinRes.body}`);
        }
        
        // 6. 감정 로그 기록 테스트
        const emotionData: EmotionLog = {
          emotion_id: Math.floor(Math.random() * 12) + 1, // 1-12 범위의 감정 ID
          log_date: new Date().toISOString().split('T')[0],
          note: `Load test emotion log ${Math.random()}`
        };
        
        let emotionRes = http.post(`${BASE_URL}/challenges/${challengeId}/emotions`, JSON.stringify(emotionData), {
          headers: headers,
          timeout: '10s',
        });
        
        success = check(emotionRes, {
          'log emotion status is 201': (r) => r.status === 201,
        });
        successRate.add(success);
        
        if (!success) {
          errors.add(1);
          console.log(`감정 로그 기록 실패: ${emotionRes.status} - ${emotionRes.body}`);
        }
      }
    } catch (e) {
      console.log(`챌린지 ID 추출 실패: ${e.message}`);
    }
  }
  
  // 7. "나의 하루" 게시물 생성 테스트
  const myDayPost = {
    content: `부하 테스트 게시물 ${Math.random()}`,
    emotion_ids: [Math.floor(Math.random() * 12) + 1]
  };
  
  let myDayRes = http.post(`${BASE_URL}/posts`, JSON.stringify(myDayPost), {
    headers: headers,
    timeout: '10s',
  });
  
  success = check(myDayRes, {
    'my day post creation status is 201': (r) => r.status === 201,
  });
  successRate.add(success);
  
  if (!success) {
    errors.add(1);
    console.log(`나의 하루 게시물 생성 실패: ${myDayRes.status} - ${myDayRes.body}`);
  }
  
  // 요청 간 짧은 지연 추가
  sleep(1);
}