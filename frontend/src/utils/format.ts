// utils/format.ts
// 포맷팅 관련 유틸리티 함수

/**
 * 숫자를 천 단위 구분자가 있는 문자열로 변환합니다.
 * @param value 변환할 숫자
 * @returns 천 단위 구분자가 있는 문자열
 */
export const formatNumber = (value: number): string => {
    return value.toLocaleString('ko-KR');
  };
  
  /**
   * 숫자를 통화 형식 문자열로 변환합니다.
   * @param value 변환할 숫자
   * @param currencyCode 통화 코드 (기본값: 'KRW')
   * @returns 통화 형식 문자열
   */
  export const formatCurrency = (value: number, currencyCode: string = 'KRW'): string => {
    return value.toLocaleString('ko-KR', { 
      style: 'currency',
      currency: currencyCode 
    });
  };
  
  /**
   * 숫자를 퍼센트 형식 문자열로 변환합니다.
   * @param value 변환할 숫자 (0-1 사이의 값)
   * @param fractionDigits 소수점 자릿수 (기본값: 0)
   * @returns 퍼센트 형식 문자열
   */
  export const formatPercent = (value: number, fractionDigits: number = 0): string => {
    return value.toLocaleString('ko-KR', { 
      style: 'percent',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    });
  };
  
  /**
   * 숫자를 소수점 자릿수를 지정하여 반올림합니다.
   * @param value 변환할 숫자
   * @param decimals 소수점 자릿수 (기본값: 2)
   * @returns 반올림된 숫자
   */
  export const roundNumber = (value: number, decimals: number = 2): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  };
  
  /**
   * 바이트 크기를 사람이 읽기 쉬운 형식으로 변환합니다.
   * @param bytes 바이트 크기
   * @param decimals 소수점 자릿수 (기본값: 2)
   * @returns 변환된 크기 문자열 (예: '1.5 KB', '2.3 MB')
   */
  export const formatFileSize = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };
  
  /**
   * 주어진 최대 길이로 텍스트를 자르고 말줄임표를 추가합니다.
   * @param text 원본 텍스트
   * @param maxLength 최대 길이
   * @returns 잘린 텍스트
   */
  export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
  
  /**
   * 문자열의 첫 글자를 대문자로 변환합니다.
   * @param str 변환할 문자열
   * @returns 첫 글자가 대문자인 문자열
   */
  export const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  /**
   * 모든 단어의 첫 글자를 대문자로 변환합니다.
   * @param str 변환할 문자열
   * @returns 각 단어의 첫 글자가 대문자인 문자열
   */
  export const capitalizeWords = (str: string): string => {
    if (!str) return '';
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  /**
   * 문자열을 카멜 케이스로 변환합니다.
   * @param str 변환할 문자열
   * @returns 카멜 케이스 문자열
   */
  export const toCamelCase = (str: string): string => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+|[_-]/g, '');
  };
  
  /**
   * 문자열을 스네이크 케이스로 변환합니다.
   * @param str 변환할 문자열
   * @returns 스네이크 케이스 문자열
   */
  export const toSnakeCase = (str: string): string => {
    return str
      .replace(/\s+/g, '_')
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  };
  
  /**
   * 문자열을 케밥 케이스로 변환합니다.
   * @param str 변환할 문자열
   * @returns 케밥 케이스 문자열
   */
  export const toKebabCase = (str: string): string => {
    return str
      .replace(/\s+/g, '-')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  };
  
  /**
   * HTML 특수 문자를 이스케이프합니다.
   * @param html HTML이 포함된 문자열
   * @returns 이스케이프된 문자열
   */
  export const escapeHtml = (html: string): string => {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * 전화번호 형식을 포맷팅합니다.
   * @param phoneNumber 전화번호 문자열
   * @returns 포맷팅된 전화번호 문자열
   */
  export const formatPhoneNumber = (phoneNumber: string): string => {
    // 숫자만 추출
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // 한국 휴대폰 번호 (010xxxxxxxx)
    if (cleaned.length === 11 && cleaned.startsWith('010')) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    
    // 한국 일반 전화번호 (02xxxxxxx)
    if (cleaned.length === 9 && cleaned.startsWith('02')) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    
    // 한국 일반 전화번호 (03x, 04x, 05x 등)
    if (cleaned.length === 10 && /^0[3-9]/.test(cleaned)) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    
    // 포맷팅할 수 없는 경우 원래 번호 반환
    return phoneNumber;
  };
  
  /**
   * 주어진 길이의 임의의 문자열을 생성합니다.
   * @param length 생성할 문자열의 길이
   * @returns 임의의 문자열
   */
  export const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  };
  
  export default {
    formatNumber,
    formatCurrency,
    formatPercent,
    roundNumber,
    formatFileSize,
    truncateText,
    capitalizeFirstLetter,
    capitalizeWords,
    toCamelCase,
    toSnakeCase,
    toKebabCase,
    escapeHtml,
    formatPhoneNumber,
    generateRandomString,
  };