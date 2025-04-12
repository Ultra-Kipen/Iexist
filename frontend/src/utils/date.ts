// utils/date.ts
// 날짜 관련 유틸리티 함수

/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환합니다.
 * @param date 날짜 객체 또는 ISO 문자열
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  /**
   * 날짜를 YYYY년 MM월 DD일 형식의 문자열로 변환합니다.
   * @param date 날짜 객체 또는 ISO 문자열
   * @returns YYYY년 MM월 DD일 형식의 문자열
   */
  export const formatDateKorean = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    
    return `${year}년 ${month}월 ${day}일`;
  };
  
  /**
   * 날짜와 시간을 YYYY-MM-DD HH:MM 형식의 문자열로 변환합니다.
   * @param date 날짜 객체 또는 ISO 문자열
   * @returns YYYY-MM-DD HH:MM 형식의 문자열
   */
  export const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  
  /**
   * 날짜를 상대적인 시간 문자열로 변환합니다. (예: "3분 전", "2시간 전")
   * @param date 날짜 객체 또는 ISO 문자열
   * @returns 상대적인 시간 문자열
   */
  export const getRelativeTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    
    // 초 단위
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) {
      return `${diffSec}초 전`;
    }
    
    // 분 단위
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return `${diffMin}분 전`;
    }
    
    // 시간 단위
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return `${diffHour}시간 전`;
    }
    
    // 일 단위
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) {
      return `${diffDay}일 전`;
    }
    
    // 주 단위
    const diffWeek = Math.floor(diffDay / 7);
    if (diffWeek < 4) {
      return `${diffWeek}주 전`;
    }
    
    // 월 단위
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) {
      return `${diffMonth}개월 전`;
    }
    
    // 년 단위
    const diffYear = Math.floor(diffDay / 365);
    return `${diffYear}년 전`;
  };
  
  /**
   * 오늘 날짜인지 확인합니다.
   * @param date 날짜 객체 또는 ISO 문자열
   * @returns 오늘 날짜이면 true, 아니면 false
   */
  export const isToday = (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };
  
  /**
   * 어제 날짜인지 확인합니다.
   * @param date 날짜 객체 또는 ISO 문자열
   * @returns 어제 날짜이면 true, 아니면 false
   */
  export const isYesterday = (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    );
  };
  
  /**
   * 주어진 날짜가 특정 날짜 범위 내에 있는지 확인합니다.
   * @param date 확인할 날짜
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 범위 내에 있으면 true, 아니면 false
   */
  export const isWithinRange = (
    date: Date | string,
    startDate: Date | string,
    endDate: Date | string
  ): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    return d >= start && d <= end;
  };
  
  /**
   * 날짜에 일수를 더합니다.
   * @param date 기준 날짜
   * @param days 더할 일수
   * @returns 계산된 새 날짜
   */
  export const addDays = (date: Date | string, days: number): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  };
  
  /**
   * 날짜에 주를 더합니다.
   * @param date 기준 날짜
   * @param weeks 더할 주 수
   * @returns 계산된 새 날짜
   */
  export const addWeeks = (date: Date | string, weeks: number): Date => {
    return addDays(date, weeks * 7);
  };
  
  /**
   * 날짜에 월수를 더합니다.
   * @param date 기준 날짜
   * @param months 더할 월 수
   * @returns 계산된 새 날짜
   */
  export const addMonths = (date: Date | string, months: number): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    d.setMonth(d.getMonth() + months);
    return d;
  };
  
  /**
   * 두 날짜 사이의 일수를 계산합니다.
   * @param date1 첫 번째 날짜
   * @param date2 두 번째 날짜
   * @returns 두 날짜 사이의 일수
   */
  export const getDaysBetween = (
    date1: Date | string,
    date2: Date | string
  ): number => {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    // 시간, 분, 초를 0으로 설정하여 날짜만 비교
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    
    return Math.floor((utc2 - utc1) / MS_PER_DAY);
  };
  
  /**
   * 주어진 월의 첫 날을 반환합니다.
   * @param date 기준 날짜
   * @returns 해당 월의 첫 날
   */
  export const getFirstDayOfMonth = (date: Date | string): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };
  
  /**
   * 주어진 월의 마지막 날을 반환합니다.
   * @param date 기준 날짜
   * @returns 해당 월의 마지막 날
   */
  export const getLastDayOfMonth = (date: Date | string): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };
  
  export default {
    formatDate,
    formatDateKorean,
    formatDateTime,
    getRelativeTime,
    isToday,
    isYesterday,
    isWithinRange,
    addDays,
    addWeeks,
    addMonths,
    getDaysBetween,
    getFirstDayOfMonth,
    getLastDayOfMonth,
  };