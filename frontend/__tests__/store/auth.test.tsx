import { login, logout, register, getCurrentUser } from '../../src/store/auth';
import { setAuthToken, setUserData, removeAuthToken } from '../../src/utils/storage';
import { ActionType } from '../../src/store/types';

// Mock utils/storage
jest.mock('../../src/utils/storage', () => ({
  setAuthToken: jest.fn(),
  setUserData: jest.fn(),
  removeAuthToken: jest.fn(),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('인증 관련 함수', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('login', () => {
    const dispatch = jest.fn();
    const email = 'test@example.com';
    const password = 'password123';
    
    test('로그인 성공 시 토큰과 사용자 데이터를 저장하고 상태를 업데이트한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          token: 'test-token',
          user: { id: 1, username: 'test', email }
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      await login(dispatch, email, password);
      
      // fetch 호출 확인
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      // 로딩 상태 변경 확인
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
      
      // 오류 초기화 확인
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.CLEAR_ERROR });
      
      // 토큰과 사용자 데이터 저장 확인
      expect(setAuthToken).toHaveBeenCalledWith('test-token');
      expect(setUserData).toHaveBeenCalledWith({ id: 1, username: 'test', email });
      
      // 상태 업데이트 확인
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_AUTHENTICATED, payload: true });
      expect(dispatch).toHaveBeenCalledWith({
        type: ActionType.SET_USER,
        payload: { id: 1, username: 'test', email }
      });
    });
    
    test('로그인 실패 시 오류를 설정한다', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          message: '이메일 또는 비밀번호가 잘못되었습니다.'
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      try {
        await login(dispatch, email, password);
        fail('로그인 실패 시 예외가 발생해야 합니다.');
      } catch (error) {
        // 로딩 상태 변경 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
        
        // 오류 초기화 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.CLEAR_ERROR });
        
        // 오류 설정 확인
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.SET_ERROR,
          payload: '로그인에 실패했습니다.'
        });
        
        // 토큰과 사용자 데이터가 저장되지 않았는지 확인
        expect(setAuthToken).not.toHaveBeenCalled();
        expect(setUserData).not.toHaveBeenCalled();
      }
    });
  });
  
  describe('logout', () => {
    const dispatch = jest.fn();
    
    test('로그아웃 시 토큰을 제거하고 상태를 초기화한다', async () => {
      await logout(dispatch);
      
      // 로딩 상태 변경 확인
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
      
      // 토큰 제거 확인
      expect(removeAuthToken).toHaveBeenCalled();
      
      // 상태 초기화 확인
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.RESET_STATE });
    });
    
    test('토큰 제거 중 오류 발생 시 오류를 설정한다', async () => {
      (removeAuthToken as jest.Mock).mockRejectedValue(new Error('토큰 제거 오류'));
      
      await logout(dispatch);
      
      // 오류 설정 확인
      expect(dispatch).toHaveBeenCalledWith({
        type: ActionType.SET_ERROR,
        payload: '로그아웃 중 오류가 발생했습니다.',
      });
    });
  });
  
  describe('register', () => {
    const dispatch = jest.fn();
    const userData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      nickname: 'New User'
    };
    
    test('회원가입 성공 시 응답 데이터를 반환한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: '회원가입이 완료되었습니다.',
          user: { id: 2, username: userData.username, email: userData.email, nickname: userData.nickname }
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await register(dispatch, userData);
      
      // fetch 호출 확인
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      // 로딩 상태 변경 확인
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
      
      // 오류 초기화 확인
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.CLEAR_ERROR });
      
      // 응답 데이터 확인
      expect(result).toEqual({
        message: '회원가입이 완료되었습니다.',
        user: { id: 2, username: userData.username, email: userData.email, nickname: userData.nickname }
      });
    });
    
    test('회원가입 실패 시 오류를 설정한다', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          message: '이미 사용 중인 이메일입니다.'
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      try {
        await register(dispatch, userData);
        fail('회원가입 실패 시 예외가 발생해야 합니다.');
      } catch (error) {
        // 로딩 상태 변경 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
        
        // 오류 초기화 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.CLEAR_ERROR });
        
        // 오류 설정 확인
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.SET_ERROR,
          payload: '회원가입에 실패했습니다.'
        });
      }
    });
  });
  
  describe('getCurrentUser', () => {
    const dispatch = jest.fn();
    
    test('사용자 정보 가져오기 성공 시 상태를 업데이트한다', async () => {
      const mockUser = { id: 1, username: 'test', email: 'test@example.com' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockUser)
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await getCurrentUser(dispatch);
      
      // fetch 호출 확인
      expect(mockFetch).toHaveBeenCalledWith('/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // 로딩 상태 변경 확인
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
      expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
      
      // 상태 업데이트 확인
      expect(dispatch).toHaveBeenCalledWith({
        type: ActionType.SET_USER,
        payload: mockUser
      });
      
      // 결과 확인
      expect(result).toEqual(mockUser);
    });
    
    test('사용자 정보 가져오기 실패 시 오류를 설정한다', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          message: '인증이 필요합니다.'
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      try {
        await getCurrentUser(dispatch);
        fail('사용자 정보 가져오기 실패 시 예외가 발생해야 합니다.');
      } catch (error) {
        // 로딩 상태 변경 확인
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: true });
        expect(dispatch).toHaveBeenCalledWith({ type: ActionType.SET_LOADING, payload: false });
        
        // 오류 설정 확인
        expect(dispatch).toHaveBeenCalledWith({
          type: ActionType.SET_ERROR,
          payload: '사용자 정보를 가져오는데 실패했습니다.'
        });
      }
    });
  });
});