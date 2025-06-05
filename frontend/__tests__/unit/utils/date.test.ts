import { 
    formatDate, 
    formatDatetime, 
    getRelativeTime, 
    isToday, 
    isYesterday,
    parseDate,
    getDateRange,
    getDayOfWeek
  } from '../../../src/utils/date';
  
  describe('Date utils', () => {
    describe('formatDate', () => {
      it('should format date correctly', () => {
        const date = new Date('2025-04-21T14:30:00');
        expect(formatDate(date)).toBe('2025.04.21');
      });
  
      it('should handle different format options', () => {
        const date = new Date('2025-04-21T14:30:00');
        expect(formatDate(date, 'yyyy-MM-dd')).toBe('2025-04-21');
        expect(formatDate(date, 'MM/dd/yyyy')).toBe('04/21/2025');
        expect(formatDate(date, 'dd.MM.yyyy')).toBe('21.04.2025');
      });
    });
  
    describe('formatDatetime', () => {
      it('should format datetime correctly', () => {
        const date = new Date('2025-04-21T14:30:00');
        expect(formatDatetime(date)).toBe('2025.04.21 14:30');
      });
  
      it('should handle different format options', () => {
        const date = new Date('2025-04-21T14:30:00');
        expect(formatDatetime(date, 'yyyy-MM-dd HH:mm')).toBe('2025-04-21 14:30');
        expect(formatDatetime(date, 'MM/dd/yyyy hh:mm a')).toBe('04/21/2025 02:30 PM');
      });
    });
  
    describe('getRelativeTime', () => {
      it('should return "방금 전" for times less than a minute ago', () => {
        const now = new Date();
        const fiveSecondsAgo = new Date(now.getTime() - 5000);
        expect(getRelativeTime(fiveSecondsAgo)).toBe('방금 전');
      });
  
      it('should return minutes for times less than an hour ago', () => {
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        expect(getRelativeTime(tenMinutesAgo)).toBe('10분 전');
      });
  
      it('should return hours for times less than a day ago', () => {
        const now = new Date();
        const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        expect(getRelativeTime(threeHoursAgo)).toBe('3시간 전');
      });
  
      it('should return days for times less than a week ago', () => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        expect(getRelativeTime(threeDaysAgo)).toBe('3일 전');
      });
  
      it('should return the date for older times', () => {
        const oldDate = new Date('2025-01-01T10:30:00');
        expect(getRelativeTime(oldDate)).toMatch(/\d{4}\.\d{2}\.\d{2}/);
      });
    });
  
    describe('isToday', () => {
      it('should return true for today', () => {
        const today = new Date();
        expect(isToday(today)).toBe(true);
      });
  
      it('should return false for yesterday', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(isToday(yesterday)).toBe(false);
      });
    });
  
    describe('isYesterday', () => {
      it('should return true for yesterday', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(isYesterday(yesterday)).toBe(true);
      });
  
      it('should return false for today', () => {
        const today = new Date();
        expect(isYesterday(today)).toBe(false);
      });
    });
  
    describe('parseDate', () => {
      it('should parse date string correctly', () => {
        const dateStr = '2025-04-21';
        const parsed = parseDate(dateStr);
        expect(parsed.getFullYear()).toBe(2025);
        expect(parsed.getMonth()).toBe(3); // 0-based, so April is 3
        expect(parsed.getDate()).toBe(21);
      });
  
      it('should handle different date formats', () => {
        const dateStr1 = '04/21/2025';
        const parsed1 = parseDate(dateStr1, 'MM/dd/yyyy');
        expect(parsed1.getFullYear()).toBe(2025);
        expect(parsed1.getMonth()).toBe(3);
        expect(parsed1.getDate()).toBe(21);
        
        const dateStr2 = '21.04.2025';
        const parsed2 = parseDate(dateStr2, 'dd.MM.yyyy');
        expect(parsed2.getFullYear()).toBe(2025);
        expect(parsed2.getMonth()).toBe(3);
        expect(parsed2.getDate()).toBe(21);
      });
    });
  
    describe('getDateRange', () => {
      it('should return a week date range correctly', () => {
        const today = new Date('2025-04-21');
        const { start, end } = getDateRange('week', today);
        expect(formatDate(start, 'yyyy-MM-dd')).toBe('2025-04-15');
        expect(formatDate(end, 'yyyy-MM-dd')).toBe('2025-04-21');
      });
  
      it('should return a month date range correctly', () => {
        const today = new Date('2025-04-21');
        const { start, end } = getDateRange('month', today);
        expect(formatDate(start, 'yyyy-MM-dd')).toBe('2025-04-01');
        expect(formatDate(end, 'yyyy-MM-dd')).toBe('2025-04-30');
      });
  
      it('should return a year date range correctly', () => {
        const today = new Date('2025-04-21');
        const { start, end } = getDateRange('year', today);
        expect(formatDate(start, 'yyyy-MM-dd')).toBe('2025-01-01');
        expect(formatDate(end, 'yyyy-MM-dd')).toBe('2025-12-31');
      });
    });
  
    describe('getDayOfWeek', () => {
      it('should return correct day of week in Korean', () => {
        const monday = new Date('2025-04-21'); // Monday
        expect(getDayOfWeek(monday)).toBe('월요일');
        
        const sunday = new Date('2025-04-20'); // Sunday
        expect(getDayOfWeek(sunday)).toBe('일요일');
      });
    });
  });