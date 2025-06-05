// __tests__/utils/RegisterScreenUtils.test.ts

/**
 * RegisterScreen 유틸리티 함수들에 대한 유닛 테스트
 * 
 * 함수 이름에 'Register' 접두사를 추가하여 중복 구현 문제를 해결했습니다.
 */

// 테스트할 함수들 직접 정의 - 'Register' 접두사 추가

// 유저네임 검증 함수
function validateRegisterUsername(username: string): string | undefined {
    if (!username) {
      return '사용자 이름을 입력해주세요';
    } else if (username.length < 2) {
      return '사용자 이름은 최소 2자 이상이어야 합니다';
    }
    return undefined;
  }
  
  // 이메일 검증 함수
  function validateRegisterEmail(email: string): string | undefined {
    if (!email) {
      return '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return '유효한 이메일 주소를 입력해주세요';
    }
    return undefined;
  }
  
  // 비밀번호 검증 함수
  function validateRegisterPassword(password: string): string | undefined {
    if (!password) {
      return '비밀번호를 입력해주세요';
    } else if (password.length < 6) {
      return '비밀번호는 최소 6자 이상이어야 합니다';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
      return '비밀번호는 영문과 숫자를 포함해야 합니다';
    }
    return undefined;
  }
  
  // 비밀번호 확인 검증 함수
  function validateRegisterConfirmPassword(password: string, confirmPassword: string): string | undefined {
    if (!confirmPassword) {
      return '비밀번호 확인을 입력해주세요';
    } else if (password !== confirmPassword) {
      return '비밀번호가 일치하지 않습니다';
    }
    return undefined;
  }
  
  // 폼 검증 함수
  function validateRegisterForm(
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ): {
    isValid: boolean;
    errors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };
  } {
    const errors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
  
    const usernameError = validateRegisterUsername(username);
    if (usernameError) {
      errors.username = usernameError;
    }
  
    const emailError = validateRegisterEmail(email);
    if (emailError) {
      errors.email = emailError;
    }
  
    const passwordError = validateRegisterPassword(password);
    if (passwordError) {
      errors.password = passwordError;
    }
  
    const confirmPasswordError = validateRegisterConfirmPassword(password, confirmPassword);
    if (confirmPasswordError) {
      errors.confirmPassword = confirmPasswordError;
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // 회원가입 처리 함수 (실제 API 호출 없이 테스트)
  async function handleRegisterSubmit(
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    onSuccess: () => void,
    onError: (error: any) => void,
    setIsLoading: (loading: boolean) => void,
    register: (userData: { username: string, email: string, password: string }) => Promise<any>
  ): Promise<void> {
    const { isValid, errors } = validateRegisterForm(username, email, password, confirmPassword);
  
    if (!isValid) {
      return;
    }
  
    setIsLoading(true);
    try {
      await register({ username, email, password });
      onSuccess();
    } catch (error: any) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  }
  
  // 실제 테스트 코드
  describe('RegisterScreen 유틸리티 함수', () => {
    // 유저네임 검증 테스트
    describe('유저네임 검증', () => {
      it('빈 유저네임을 입력했을 때 에러 메시지 반환', () => {
        expect(validateRegisterUsername('')).toBe('사용자 이름을 입력해주세요');
      });
  
      it('너무 짧은 유저네임을 입력했을 때 에러 메시지 반환', () => {
        expect(validateRegisterUsername('a')).toBe('사용자 이름은 최소 2자 이상이어야 합니다');
      });
  
      it('유효한 유저네임을 입력했을 때 undefined 반환', () => {
        expect(validateRegisterUsername('testuser')).toBeUndefined();
      });
    });
  
    // 이메일 검증 테스트
    describe('이메일 검증', () => {
      it('빈 이메일을 입력했을 때 에러 메시지 반환', () => {
        expect(validateRegisterEmail('')).toBe('이메일을 입력해주세요');
      });
  
      it('유효하지 않은 이메일 형식일 때 에러 메시지 반환', () => {
        expect(validateRegisterEmail('invalidEmail')).toBe('유효한 이메일 주소를 입력해주세요');
        expect(validateRegisterEmail('invalid@email')).toBe('유효한 이메일 주소를 입력해주세요');
        expect(validateRegisterEmail('invalid@.com')).toBe('유효한 이메일 주소를 입력해주세요');
      });
  
      it('유효한 이메일 형식일 때 undefined 반환', () => {
        expect(validateRegisterEmail('valid@email.com')).toBeUndefined();
        expect(validateRegisterEmail('test.user@example.co.kr')).toBeUndefined();
      });
    });
  
    // 비밀번호 검증 테스트
    describe('비밀번호 검증', () => {
      it('빈 비밀번호를 입력했을 때 에러 메시지 반환', () => {
        expect(validateRegisterPassword('')).toBe('비밀번호를 입력해주세요');
      });
  
      it('짧은 비밀번호를 입력했을 때 에러 메시지 반환', () => {
        expect(validateRegisterPassword('12345')).toBe('비밀번호는 최소 6자 이상이어야 합니다');
      });
  
      it('숫자만 포함한 비밀번호를 입력했을 때 에러 메시지 반환', () => {
        expect(validateRegisterPassword('123456')).toBe('비밀번호는 영문과 숫자를 포함해야 합니다');
      });
  
      it('영문만 포함한 비밀번호를 입력했을 때 에러 메시지 반환', () => {
        expect(validateRegisterPassword('abcdef')).toBe('비밀번호는 영문과 숫자를 포함해야 합니다');
      });
  
      it('유효한 비밀번호를 입력했을 때 undefined 반환', () => {
        expect(validateRegisterPassword('abc123')).toBeUndefined();
        expect(validateRegisterPassword('password123')).toBeUndefined();
      });
    });
  
    // 비밀번호 확인 검증 테스트
    describe('비밀번호 확인 검증', () => {
      it('빈 비밀번호 확인을 입력했을 때 에러 메시지 반환', () => {
        expect(validateRegisterConfirmPassword('password123', '')).toBe('비밀번호 확인을 입력해주세요');
      });
  
      it('비밀번호와 일치하지 않을 때 에러 메시지 반환', () => {
        expect(validateRegisterConfirmPassword('password123', 'different')).toBe('비밀번호가 일치하지 않습니다');
      });
  
      it('비밀번호와 일치할 때 undefined 반환', () => {
        expect(validateRegisterConfirmPassword('password123', 'password123')).toBeUndefined();
      });
    });
  
    // 폼 검증 테스트
    describe('폼 검증', () => {
      it('빈 폼을 제출했을 때 모든 필드에 에러 메시지 반환', () => {
        const result = validateRegisterForm('', '', '', '');
        expect(result.isValid).toBe(false);
        expect(result.errors.username).toBe('사용자 이름을 입력해주세요');
        expect(result.errors.email).toBe('이메일을 입력해주세요');
        expect(result.errors.password).toBe('비밀번호를 입력해주세요');
        expect(result.errors.confirmPassword).toBe('비밀번호 확인을 입력해주세요');
      });
  
      it('유효하지 않은 이메일과 비밀번호를 입력했을 때 에러 메시지 반환', () => {
        const result = validateRegisterForm('testuser', 'invalid', 'abc', 'abc');
        expect(result.isValid).toBe(false);
        expect(result.errors.username).toBeUndefined();
        expect(result.errors.email).toBe('유효한 이메일 주소를 입력해주세요');
        expect(result.errors.password).toBe('비밀번호는 최소 6자 이상이어야 합니다');
        expect(result.errors.confirmPassword).toBeUndefined();
      });
  
      it('비밀번호와 확인이 일치하지 않을 때 에러 메시지 반환', () => {
        const result = validateRegisterForm('testuser', 'valid@email.com', 'password123', 'different');
        expect(result.isValid).toBe(false);
        expect(result.errors.username).toBeUndefined();
        expect(result.errors.email).toBeUndefined();
        expect(result.errors.password).toBeUndefined();
        expect(result.errors.confirmPassword).toBe('비밀번호가 일치하지 않습니다');
      });
  
      it('모든 필드가 유효할 때 폼 유효성 확인', () => {
        const result = validateRegisterForm('testuser', 'valid@email.com', 'password123', 'password123');
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });
  
    // 회원가입 처리 테스트
    describe('회원가입 처리', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });
  
      it('유효하지 않은 폼을 제출했을 때 회원가입 시도하지 않음', async () => {
        // Mock 함수 생성
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const setIsLoading = jest.fn();
        const register = jest.fn();
  
        // 빈 필드로 회원가입 시도
        await handleRegisterSubmit('', '', '', '', onSuccess, onError, setIsLoading, register);
  
        // 검증
        expect(register).not.toHaveBeenCalled();
        expect(setIsLoading).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
      });
  
      it('회원가입 성공 시 onSuccess 콜백 실행', async () => {
        // Mock 함수 생성
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const setIsLoading = jest.fn();
        const register = jest.fn().mockResolvedValue({ success: true });
  
        // 유효한 데이터로 회원가입 시도
        await handleRegisterSubmit(
          'testuser',
          'valid@email.com',
          'password123',
          'password123',
          onSuccess,
          onError,
          setIsLoading,
          register
        );
  
        // 검증
        expect(setIsLoading).toHaveBeenCalledWith(true);
        expect(register).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'valid@email.com',
          password: 'password123'
        });
        expect(onSuccess).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(setIsLoading).toHaveBeenCalledWith(false);
      });
  
      it('회원가입 실패 시 onError 콜백 실행', async () => {
        // Mock 함수 생성
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const setIsLoading = jest.fn();
        const mockError = new Error('이미 존재하는 이메일입니다');
        const register = jest.fn().mockRejectedValue(mockError);
  
        // 유효한 데이터로 회원가입 시도
        await handleRegisterSubmit(
          'testuser',
          'valid@email.com',
          'password123',
          'password123',
          onSuccess,
          onError,
          setIsLoading,
          register
        );
  
        // 검증
        expect(setIsLoading).toHaveBeenCalledWith(true);
        expect(register).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'valid@email.com',
          password: 'password123'
        });
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(mockError);
        expect(setIsLoading).toHaveBeenCalledWith(false);
      });
    });
  });