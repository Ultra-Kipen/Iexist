// __tests__/hooks/useForm.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useForm } from '../../src/hooks/useForm';

describe('useForm', () => {
  // 폼 초기값 및 제출 함수 설정
  const initialValues = {
    name: '',
    email: '',
    active: false,
  };
  
  const mockSubmit = jest.fn();
  
  // 유효성 검사 함수
  const mockValidate = jest.fn((values) => {
    const errors: Record<string, string> = {};
    
    if (!values.name) {
      errors.name = '이름은 필수입니다';
    }
    
    if (!values.email) {
      errors.email = '이메일은 필수입니다';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = '유효한 이메일 형식이 아닙니다';
    }
    
    return errors;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기값으로 폼 상태를 초기화한다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit })
    );
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleChange 함수로 폼 값을 변경할 수 있다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit })
    );
    
    act(() => {
      result.current.handleChange('name', 'John Doe');
    });
    
    expect(result.current.values.name).toBe('John Doe');
    
    // 해당 필드가 터치되었는지 확인
    expect(result.current.isTouched('name')).toBe(true);
  });

  it('handleTextChange 함수로 텍스트 입력을 처리할 수 있다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit })
    );
    
    const mockEvent = {
      nativeEvent: { text: 'test@example.com' }
    };
    
    act(() => {
      // @ts-ignore - 테스트 목적으로 이벤트 타입 무시
      result.current.handleTextChange('email')(mockEvent);
    });
    
    expect(result.current.values.email).toBe('test@example.com');
  });

  it('handleToggleChange 함수로 토글 입력을 처리할 수 있다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit })
    );
    
    act(() => {
      result.current.handleToggleChange('active')(true);
    });
    
    expect(result.current.values.active).toBe(true);
  });

  it('setFieldValue 함수로 특정 필드 값을 설정할 수 있다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit })
    );
    
    act(() => {
      result.current.setFieldValue('name', 'Jane Doe');
    });
    
    expect(result.current.values.name).toBe('Jane Doe');
  });

  it('setFieldValues 함수로 여러 필드 값을 한번에 설정할 수 있다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit })
    );
    
    act(() => {
      result.current.setFieldValues({
        name: 'Jane Doe',
        email: 'jane@example.com'
      });
    });
    
    expect(result.current.values.name).toBe('Jane Doe');
    expect(result.current.values.email).toBe('jane@example.com');
    // 원래 값은 유지됨
    expect(result.current.values.active).toBe(false);
  });

  it('validateForm 함수로 폼 유효성을 검사할 수 있다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit, validate: mockValidate })
    );
    
    act(() => {
      result.current.validateForm();
    });
    
    // 초기값이 비어있어 유효성 검사 오류 발생
    expect(mockValidate).toHaveBeenCalledWith(initialValues);
    expect(result.current.errors).toEqual({
      name: '이름은 필수입니다',
      email: '이메일은 필수입니다'
    });
  });

  it('handleSubmit 함수는 폼이 유효할 때만 onSubmit 콜백을 호출한다', async () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit, validate: mockValidate })
    );
    
    // 유효하지 않은 상태에서 제출
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    // 모든 필드가 터치됨
    expect(result.current.isTouched('name')).toBe(true);
    expect(result.current.isTouched('email')).toBe(true);
    
    // 오류가 있어 onSubmit이 호출되지 않음
    expect(mockSubmit).not.toHaveBeenCalled();
    
    // 유효한 값으로 변경
    act(() => {
      result.current.setFieldValues({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
    
    // 재검증 및 제출
    await act(async () => {
      result.current.validateForm();
      await result.current.handleSubmit();
    });
    
    // 이제 폼이 유효하므로 onSubmit 호출됨
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      active: false
    });
  });

  it('resetForm 함수로 폼을 초기 상태로 되돌릴 수 있다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit })
    );
    
    // 값 변경
    act(() => {
      result.current.setFieldValues({
        name: 'John Doe',
        email: 'john@example.com',
        active: true
      });
      
      // 필드 터치
      result.current.setFieldTouched('name');
      result.current.setFieldTouched('email');
    });
    
    // 리셋
    act(() => {
      result.current.resetForm();
    });
    
    // 초기 상태로 돌아감
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isTouched('name')).toBe(false);
    expect(result.current.isTouched('email')).toBe(false);
  });

  it('setFieldError와 getFieldError 함수로 오류를 관리할 수 있다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit })
    );
    
    act(() => {
      result.current.setFieldError('email', '이메일 형식이 잘못되었습니다');
    });
    
    expect(result.current.getFieldError('email')).toBe('이메일 형식이 잘못되었습니다');
    expect(result.current.getFieldError('name')).toBe('');
  });

  it('isValid 함수로 폼 전체의 유효성을 확인할 수 있다', () => {
    const { result } = renderHook(() => 
      useForm({ initialValues, onSubmit: mockSubmit })
    );
    
    // 초기에는 오류가 없으므로 유효함
    expect(result.current.isValid()).toBe(true);
    
    // 오류 설정
    act(() => {
      result.current.setFieldError('email', '이메일 형식이 잘못되었습니다');
    });
    
    // 이제 유효하지 않음
    expect(result.current.isValid()).toBe(false);
  });
});