// utils/validation.ts
// 폼 유효성 검증 관련 유틸리티 함수

/**
 * 이메일 형식이 유효한지 검사합니다.
 * @param email 검사할 이메일 문자열
 * @returns 유효한 이메일이면 true, 아니면 false
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * 비밀번호 강도를 검사합니다.
   * - 최소 6자 이상
   * - 영문자 포함
   * - 숫자 포함
   * - 특수문자 포함
   * @param password 검사할 비밀번호
   * @returns 유효한 비밀번호이면 true, 아니면 false
   */
  export const isValidPassword = (password: string): boolean => {
    // 최소 6자 이상, 영문, 숫자, 특수문자 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return passwordRegex.test(password);
  };
  
  /**
   * 비밀번호 강도를 점수로 반환합니다. (0~4)
   * @param password 검사할 비밀번호
   * @returns 비밀번호 강도 점수 (0: 매우 약함, 1: 약함, 2: 보통, 3: 강함, 4: 매우 강함)
   */
  export const getPasswordStrength = (password: string): number => {
    let score = 0;
    
    // 비어있으면 0점
    if (!password) return 0;
    
    // 길이에 따른 점수
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    
    // 대소문자, 숫자, 특수문자 포함 여부에 따른 점수
    if (/[A-Z]/.test(password)) score += 0.5;
    if (/[a-z]/.test(password)) score += 0.5;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // 최종 점수는 0~4 사이
    return Math.min(4, score);
  };
  
  /**
   * URL 형식이 유효한지 검사합니다.
   * @param url 검사할 URL 문자열
   * @returns 유효한 URL이면 true, 아니면 false
   */
  export const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  /**
   * 전화번호 형식이 유효한지 검사합니다. (한국 전화번호 형식)
   * @param phoneNumber 검사할 전화번호 문자열
   * @returns 유효한 전화번호면 true, 아니면 false
   */
  export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    // 한국 전화번호 형식 (010-xxxx-xxxx 또는 010xxxxxxxx)
    const phoneRegex = /^(01[016789]|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phoneNumber);
  };
  
  /**
   * 필수 입력 항목인지 검사합니다.
   * @param value 검사할 값
   * @returns 값이 존재하면 true, 아니면 false
   */
  export const isRequired = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  };
  
  /**
   * 값의 길이가 최소 길이 이상인지 검사합니다.
   * @param value 검사할 값
   * @param minLength 최소 길이
   * @returns 최소 길이 이상이면 true, 아니면 false
   */
  export const minLength = (value: string, minLength: number): boolean => {
    return value.length >= minLength;
  };
  
  /**
   * 값의 길이가 최대 길이 이하인지 검사합니다.
   * @param value 검사할 값
   * @param maxLength 최대 길이
   * @returns 최대 길이 이하이면 true, 아니면 false
   */
  export const maxLength = (value: string, maxLength: number): boolean => {
    return value.length <= maxLength;
  };
  
  /**
   * 두 값이 일치하는지 검사합니다.
   * @param value1 첫 번째 값
   * @param value2 두 번째 값
   * @returns 두 값이 일치하면 true, 아니면 false
   */
  export const matches = (value1: any, value2: any): boolean => {
    return value1 === value2;
  };
  
  /**
   * 숫자 형식이 유효한지 검사합니다.
   * @param value 검사할 값
   * @returns 유효한 숫자이면 true, 아니면 false
   */
  export const isNumber = (value: string): boolean => {
    return !isNaN(Number(value));
  };
  
  /**
   * 정수 형식이 유효한지 검사합니다.
   * @param value 검사할 값
   * @returns 유효한 정수이면 true, 아니면 false
   */
  export const isInteger = (value: string): boolean => {
    return Number.isInteger(Number(value));
  };
  
  /**
   * 값이 최소값 이상인지 검사합니다.
   * @param value 검사할 값
   * @param min 최소값
   * @returns 최소값 이상이면 true, 아니면 false
   */
  export const min = (value: number, min: number): boolean => {
    return value >= min;
  };
  
  /**
   * 값이 최대값 이하인지 검사합니다.
   * @param value 검사할 값
   * @param max 최대값
   * @returns 최대값 이하이면 true, 아니면 false
   */
  export const max = (value: number, max: number): boolean => {
    return value <= max;
  };
  
  /**
   * 값이 미래 날짜인지 검사합니다.
   * @param date 검사할 날짜
   * @returns 미래 날짜이면 true, 아니면 false
   */
  export const isFutureDate = (date: Date | string): boolean => {
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return checkDate >= today;
  };
  
  /**
   * 값이 과거 날짜인지 검사합니다.
   * @param date 검사할 날짜
   * @returns 과거 날짜이면 true, 아니면 false
   */
  export const isPastDate = (date: Date | string): boolean => {
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return checkDate < today;
  };
  
  export default {
    isValidEmail,
    isValidPassword,
    getPasswordStrength,
    isValidUrl,
    isValidPhoneNumber,
    isRequired,
    minLength,
    maxLength,
    matches,
    isNumber,
    isInteger,
    min,
    max,
    isFutureDate,
    isPastDate,
  };