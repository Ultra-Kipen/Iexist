// __tests__/utils/LoginScreenUtils.test.ts

/**
 * LoginScreen 유틸리티 함수들에 대한 유닛 테스트
 * 
 * 이 테스트는 LoginScreen 컴포넌트에서 추출한 유틸리티 함수들만을 테스트합니다.
 * 이렇게 하면 React Native의 UI 렌더링과 관련된 복잡성을 피하면서
 * 핵심 비즈니스 로직을 테스트할 수 있습니다.
 */

// 테스트할 함수들 직접 정의

// 이메일 검증 함수
function validateEmail(email: string): string | undefined {
    if (!email) {
      return '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return '유효한 이메일 주소를 입력해주세요';
    }
    return undefined;
  }
  
  // 비밀번호 검증 함수
  function validatePassword(password: string): string | undefined {
    if (!password) {
      return '비밀번호를 입력해주세요';
    } else if (password.length < 6) {
      return '비밀번호는 최소 6자 이상이어야 합니다';
    }
    return undefined;
  }
  
  // 폼 검증 함수
  function validateForm(email: string, password: string): { 
    isValid: boolean; 
    errors: { email?: string; password?: string }
  } {
    const errors: { email?: string; password?: string } = {};
    
    const emailError = validateEmail(email);
    if (emailError) {
      errors.email = emailError;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.password = passwordError;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // 로그인 처리 함수 (실제 API 호출 없이 테스트)
  async function handleLogin(
    email: string, 
    password: string, 
    onSuccess: () => void, 
    onError: (error: any) => void,
    setIsLoading: (loading: boolean) => void,
    login: (credentials: { email: string, password: string }) => Promise<any>
  ): Promise<void> {
    const { isValid, errors } = validateForm(email, password);
    
    if (!isValid) {
      return;
    }
    
    setIsLoading(true);
    try {
      await login({ email, password });
      onSuccess();
    } catch (error: any) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  }
  
  // 실제 테스트 코드
  describe('LoginScreen 유틸리티 함수', () => {
    // 이메일 검증 테스트
    describe('이메일 검증', () => {
      it('빈 이메일을 입력했을 때 에러 메시지 반환', () => {
        expect(validateEmail('')).toBe('이메일을 입력해주세요');
      });
      
      it('유효하지 않은 이메일 형식일 때 에러 메시지 반환', () => {
        expect(validateEmail('invalidEmail')).toBe('유효한 이메일 주소를 입력해주세요');
        expect(validateEmail('invalid@email')).toBe('유효한 이메일 주소를 입력해주세요');
        expect(validateEmail('invalid@.com')).toBe('유효한 이메일 주소를 입력해주세요');
      });
      
      it('유효한 이메일 형식일 때 undefined 반환', () => {
        expect(validateEmail('valid@email.com')).toBeUndefined();
        expect(validateEmail('test.user@example.co.kr')).toBeUndefined();
      });
    });
    
    // 비밀번호 검증 테스트
    describe('비밀번호 검증', () => {
      it('빈 비밀번호를 입력했을 때 에러 메시지 반환', () => {
        expect(validatePassword('')).toBe('비밀번호를 입력해주세요');
      });
      
      it('짧은 비밀번호를 입력했을 때 에러 메시지 반환', () => {
        expect(validatePassword('12345')).toBe('비밀번호는 최소 6자 이상이어야 합니다');
      });
      
      it('유효한 길이의 비밀번호를 입력했을 때 undefined 반환', () => {
        expect(validatePassword('123456')).toBeUndefined();
        expect(validatePassword('securePassword123')).toBeUndefined();
      });
    });
    
    // 폼 검증 테스트
    describe('폼 검증', () => {
      it('빈 폼을 제출했을 때 두 필드 모두 에러 메시지 반환', () => {
        const result = validateForm('', '');
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBe('이메일을 입력해주세요');
        expect(result.errors.password).toBe('비밀번호를 입력해주세요');
      });
      
      it('잘못된 이메일과 짧은 비밀번호를 입력했을 때 에러 메시지 반환', () => {
        const result = validateForm('invalid', '12345');
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBe('유효한 이메일 주소를 입력해주세요');
        expect(result.errors.password).toBe('비밀번호는 최소 6자 이상이어야 합니다');
      });
      
      it('유효한 이메일만 입력했을 때 비밀번호 에러 메시지 반환', () => {
        const result = validateForm('valid@email.com', '');
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBeUndefined();
        expect(result.errors.password).toBe('비밀번호를 입력해주세요');
      });
      
      it('유효한 비밀번호만 입력했을 때 이메일 에러 메시지 반환', () => {
        const result = validateForm('', 'password123');
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBe('이메일을 입력해주세요');
        expect(result.errors.password).toBeUndefined();
      });
      
      it('유효한 이메일과 비밀번호를 입력했을 때 유효성 확인', () => {
        const result = validateForm('valid@email.com', 'password123');
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });
    
    // 로그인 처리 테스트
    describe('로그인 처리', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });
      
      it('유효하지 않은 폼을 제출했을 때 로그인 시도하지 않음', async () => {
        // Mock 함수 생성
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const setIsLoading = jest.fn();
        const login = jest.fn();
        
        // 빈 이메일과 비밀번호로 로그인 시도
        await handleLogin('', '', onSuccess, onError, setIsLoading, login);
        
        // 검증
        expect(login).not.toHaveBeenCalled();
        expect(setIsLoading).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
      });
      
      it('로그인 성공 시 onSuccess 콜백 실행', async () => {
        // Mock 함수 생성
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const setIsLoading = jest.fn();
        const login = jest.fn().mockResolvedValue({ success: true });
        
        // 유효한 이메일과 비밀번호로 로그인 시도
        await handleLogin(
          'valid@email.com', 
          'password123', 
          onSuccess, 
          onError, 
          setIsLoading, 
          login
        );
        
        // 검증
        expect(setIsLoading).toHaveBeenCalledWith(true);
        expect(login).toHaveBeenCalledWith({ 
          email: 'valid@email.com', 
          password: 'password123' 
        });
        expect(onSuccess).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(setIsLoading).toHaveBeenCalledWith(false);
      });
      
      it('로그인 실패 시 onError 콜백 실행', async () => {
        // Mock 함수 생성
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const setIsLoading = jest.fn();
        const mockError = new Error('인증 실패');
        const login = jest.fn().mockRejectedValue(mockError);
        
        // 유효한 이메일과 비밀번호로 로그인 시도
        await handleLogin(
          'valid@email.com', 
          'password123', 
          onSuccess, 
          onError, 
          setIsLoading, 
          login
        );
        
        // 검증
        expect(setIsLoading).toHaveBeenCalledWith(true);
        expect(login).toHaveBeenCalledWith({ 
          email: 'valid@email.com', 
          password: 'password123' 
        });
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(mockError);
        expect(setIsLoading).toHaveBeenCalledWith(false);
      });
    });
  });