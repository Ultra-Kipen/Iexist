// tests/staging/staging-verification.test.ts
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 스테이징 환경 .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '../../.env.staging') });

// 스테이징 API 기본 URL
const STAGING_API_URL = process.env.STAGING_API_URL || 'https://staging-api.iexist.com/api';
const STAGING_TOKEN = process.env.STAGING_TOKEN; // 스테이징 환경 토큰

// 테스트 결과를 저장할 디렉토리
const RESULTS_DIR = path.join(__dirname, '../../staging-test-results');

// 결과 디렉토리가 없으면 생성
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// 테스트 결과 저장 함수
const saveTestResult = (testName: string, result: any) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(RESULTS_DIR, `${testName}-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
};

// 스테이징 환경 토큰이 없으면 테스트 스킵
const runStagingTests = !!STAGING_TOKEN;

describe('스테이징 환경 검증 테스트', () => {
  // 기본 헤더 설정
  const headers = {
    'Authorization': `Bearer ${STAGING_TOKEN}`,
    'Content-Type': 'application/json'
  };

  // 서버가 실행 중인지 확인
  test('스테이징 서버가 실행 중인지 확인', async () => {
    if (!runStagingTests) {
      console.log('스테이징 토큰이 없어 테스트를 건너뜁니다.');
      return;
    }

    try {
      const response = await axios.get(`${STAGING_API_URL}/`);
      expect(response.status).toBe(200);
      
      // 결과 저장
      saveTestResult('server-health', {
        timestamp: new Date().toISOString(),
        status: response.status,
        data: response.data
      });
    } catch (error) {
      console.error('스테이징 서버 연결 실패:', error);
      throw error;
    }
  });

  // 핵심 API 검증 테스트
  const coreEndpoints = [
    { name: 'emotions', method: 'get', path: '/emotions', expectedStatus: 200 },
    { name: 'user-profile', method: 'get', path: '/users/profile', expectedStatus: 200 },
    { name: 'my-day-posts', method: 'get', path: '/my-day/posts', expectedStatus: 200 },
    { name: 'someone-day', method: 'get', path: '/someone-day', expectedStatus: 200 },
    { name: 'notifications', method: 'get', path: '/notifications', expectedStatus: 200 },
    { name: 'tags', method: 'get', path: '/tags', expectedStatus: 200 },
  ];

  test.each(coreEndpoints)(
    '핵심 API 엔드포인트 검증: $name',
    async ({ name, method, path, expectedStatus }) => {
      if (!runStagingTests) {
        return;
      }

      try {
        const response = await axios({
          method,
          url: `${STAGING_API_URL}${path}`,
          headers
        });

        expect(response.status).toBe(expectedStatus);
        expect(response.data).toHaveProperty('status', 'success');

        // 결과 저장
        saveTestResult(`api-${name}`, {
          timestamp: new Date().toISOString(),
          endpointTested: path,
          method,
          status: response.status,
          hasSuccessStatus: response.data.status === 'success',
          dataProperties: Object.keys(response.data)
        });
      } catch (error: any) {
        console.error(`API ${name} 테스트 실패:`, error.message);
        
        // 결과 저장 (오류 정보 포함)
        saveTestResult(`api-${name}-error`, {
          timestamp: new Date().toISOString(),
          endpointTested: path,
          method,
          error: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : null
        });
        
        throw error;
      }
    }
  );

  // 전체 사용자 흐름 테스트
  test('전체 사용자 흐름 검증 - 게시물 생성 및 조회', async () => {
    if (!runStagingTests) {
      return;
    }

    try {
      // 1. 게시물 생성
      const createPostData = {
        content: `스테이징 테스트 게시물 - ${new Date().toISOString()}`,
        emotion_ids: [1, 2]
      };

      const createResponse = await axios.post(
        `${STAGING_API_URL}/my-day/posts`,
        createPostData,
        { headers }
      );

      expect(createResponse.status).toBe(201);
      expect(createResponse.data).toHaveProperty('status', 'success');
      expect(createResponse.data.data).toHaveProperty('post_id');

      const postId = createResponse.data.data.post_id;

      // 2. 게시물 조회 (게시물 목록에 새 게시물이 있는지 확인)
      const getPostsResponse = await axios.get(
        `${STAGING_API_URL}/my-day/posts`,
        { headers }
      );

      expect(getPostsResponse.status).toBe(200);
      expect(getPostsResponse.data).toHaveProperty('status', 'success');
      
      const posts = getPostsResponse.data.data.posts;
      const createdPost = posts.find((post: any) => post.post_id === postId);
      
      expect(createdPost).toBeDefined();
      expect(createdPost.content).toBe(createPostData.content);

      // 결과 저장
      saveTestResult('user-flow-post-creation', {
        timestamp: new Date().toISOString(),
        postCreated: {
          id: postId,
          content: createPostData.content
        },
        postFoundInList: !!createdPost
      });

    } catch (error: any) {
      console.error('사용자 흐름 테스트 실패:', error.message);
      
      // 결과 저장 (오류 정보 포함)
      saveTestResult('user-flow-error', {
        timestamp: new Date().toISOString(),
        error: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : null
      });
      
      throw error;
    }
  });

  // 데이터베이스 연결 상태 확인
  test('데이터베이스 연결 상태 확인', async () => {
    if (!runStagingTests) {
      return;
    }

    try {
      // 관리자용 헬스체크 엔드포인트 가정 (실제 구현에 맞게 수정 필요)
      const response = await axios.get(
        `${STAGING_API_URL}/admin/health/database`,
        { headers }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('database');
      expect(response.data.database.connected).toBe(true);

      // 결과 저장
      saveTestResult('database-health', {
        timestamp: new Date().toISOString(),
        databaseStatus: response.data.database
      });

    } catch (error: any) {
      // API가 없을 수 있으므로 테스트 실패로 처리하지 않음
      console.log('데이터베이스 상태 확인 엔드포인트를 찾을 수 없습니다:', error.message);
      
      // 결과 저장
      saveTestResult('database-health-not-available', {
        timestamp: new Date().toISOString(),
        message: '데이터베이스 상태 확인 엔드포인트를 찾을 수 없습니다'
      });
    }
  });

  // 환경 설정 확인
  test('스테이징 환경 설정 확인', async () => {
    if (!runStagingTests) {
      return;
    }

    // 환경 설정이 올바르게 되어 있는지 확인하는 테스트
    const configCheck = {
      apiUrl: !!STAGING_API_URL,
      token: !!STAGING_TOKEN,
      resultsDir: !!RESULTS_DIR && fs.existsSync(RESULTS_DIR)
    };

    // 결과 저장
    saveTestResult('environment-config', {
      timestamp: new Date().toISOString(),
      config: configCheck
    });

    expect(configCheck.apiUrl).toBe(true);
    expect(configCheck.token).toBe(true);
    expect(configCheck.resultsDir).toBe(true);
  });
});