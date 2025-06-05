import axios, { AxiosError } from 'axios';

// 백엔드 API 기본 URL
const API_URL = 'http://localhost:3000/api';

describe('인증 API 테스트', () => {
  beforeAll(() => {
    // axios 타임아웃 설정
    axios.defaults.timeout = 5000;
  });

  // 서버가 실행 중인지 확인하는 헬퍼 함수
  const checkServerRunning = async (): Promise<boolean> => {
    const endpoints = [
      `${API_URL}/status`,
      `${API_URL}`,
      'http://localhost:3000'
    ];

    for (const url of endpoints) {
      try {
        await axios.get(url, { timeout: 2000 });
        return true;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // 응답이 있으면 서버는 실행 중
          return true;
        }
        // 다음 엔드포인트 시도
      }
    }

    return false;
  };

  // 각 테스트 전에 서버가 실행 중인지 확인
  beforeEach(async () => {
    const isServerRunning = await checkServerRunning();
    if (!isServerRunning) {
      console.warn('백엔드 서버가 실행되고 있지 않습니다. 테스트가 실패할 수 있습니다.');
    }
  });

  it('회원가입 성공 테스트', async () => {
    const uniqueId = Date.now().toString().slice(-6);
    const testUser = {
      username: `testuser_${uniqueId}`,
      email: `test_${uniqueId}@example.com`,
      password: 'Password123!'
    };

    try {
      const response = await axios.post(`${API_URL}/auth/register`, testUser);
      
      console.log('회원가입 응답 전체:', JSON.stringify(response.data, null, 2));
      console.log('응답 상태:', response.status);
      console.log('토큰 존재 여부:', !!response.data.token);
      
      expect(response.status).toBe(201);
      
      // 실제 응답 구조에 따라 조건부 검증
      if (response.data.status) {
        expect(response.data.status).toBe('success');
      }
      
      // 토큰이 최상위에 있을 수도 있고 data 안에 있을 수도 있음
      const token = response.data.token || response.data.data?.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('회원가입 실패:', error.response?.data);
        throw error;
      }
      throw error;
    }
  });

  it('로그인 성공 테스트', async () => {
    const uniqueId = Date.now().toString().slice(-6);
    const testUser = {
      username: `testuser_${uniqueId}`,
      email: `test_${uniqueId}@example.com`,
      password: 'Password123!'
    };

    try {
      // 먼저 회원가입
      await axios.post(`${API_URL}/auth/register`, testUser);
      
      // 로그인 시도
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      console.log('로그인 응답 전체:', JSON.stringify(response.data, null, 2));
      console.log('응답 상태:', response.status);
      
      expect(response.status).toBe(200);
      
      // 실제 응답 구조에 따라 조건부 검증
      if (response.data.status) {
        expect(response.data.status).toBe('success');
      }
      
      // 토큰이 최상위에 있을 수도 있고 data 안에 있을 수도 있음
      const token = response.data.token || response.data.data?.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('로그인 실패:', error.response?.data);
        throw error;
      }
      throw error;
    }
  });
  
  it('잘못된 자격 증명으로 로그인 실패 테스트', async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123'
      });
      
      // 성공했을 경우 테스트 실패
      throw new Error('잘못된 자격 증명으로 로그인이 성공하면 안 됩니다');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // authController에서 사용자 없음: 404, 비밀번호 틀림: 401
        expect([401, 404]).toContain(error.response.status);
        expect(error.response.data.status).toBe('error');
        expect(error.response.data.message).toBeDefined();
      } else if (!axios.isAxiosError(error)) {
        throw error;
      } else {
        throw new Error('예상치 못한 오류가 발생했습니다');
      }
    }
  });
  
  it('빈 이메일로 로그인 시도 시 실패해야 함', async () => {
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: '',
        password: 'Test123!'
      });
      
      throw new Error('빈 이메일로 로그인이 성공하면 안 됩니다');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect([400, 401, 404]).toContain(error.response.status);
        expect(error.response.data.status).toBe('error');
      } else if (!axios.isAxiosError(error)) {
        throw error;
      } else {
        throw new Error('예상치 못한 오류가 발생했습니다');
      }
    }
  });

  it('빈 비밀번호로 로그인 시도 시 실패해야 함', async () => {
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: ''
      });
      
      throw new Error('빈 비밀번호로 로그인이 성공하면 안 됩니다');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect([400, 401, 404]).toContain(error.response.status);
        expect(error.response.data.status).toBe('error');
      } else if (!axios.isAxiosError(error)) {
        throw error;
      } else {
        throw new Error('예상치 못한 오류가 발생했습니다');
      }
    }
  });

  it('잘못된 형식의 이메일로 로그인 시도 시 실패해야 함', async () => {
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'invalid-email',
        password: 'Test123!'
      });
      
      throw new Error('잘못된 형식의 이메일로 로그인이 성공하면 안 됩니다');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect([400, 401, 404]).toContain(error.response.status);
        expect(error.response.data.status).toBe('error');
      } else if (!axios.isAxiosError(error)) {
        throw error;
      } else {
        throw new Error('예상치 못한 오류가 발생했습니다');
      }
    }
  });

  it('중복 이메일로 회원가입 시도 시 실패해야 함', async () => {
    const testUser = {
      username: 'testuser',
      email: 'duplicate@example.com',
      password: 'Password123!'
    };

    try {
      // 첫 번째 회원가입
      await axios.post(`${API_URL}/auth/register`, testUser);
      
      // 같은 이메일로 두 번째 회원가입 시도
      await axios.post(`${API_URL}/auth/register`, testUser);
      
      throw new Error('중복 이메일로 회원가입이 성공하면 안 됩니다');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log('중복 이메일 오류 응답:', JSON.stringify(error.response.data, null, 2));
        console.log('오류 상태 코드:', error.response.status);
        
        // 실제 응답에 따라 400 또는 409 허용
        expect([400, 409]).toContain(error.response.status);
        expect(error.response.data.status).toBe('error');
        expect(error.response.data.message).toMatch(/이미 존재|already exists|duplicate/i);
      } else if (!axios.isAxiosError(error)) {
        throw error;
      } else {
        throw new Error('예상치 못한 오류가 발생했습니다');
      }
    }
  });
});