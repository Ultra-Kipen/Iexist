import { 
    formatNumber, 
    formatFileSize, 
    truncateText, 
    formatPhoneNumber,
    formatCurrency,
    capitalize
  } from '../../../src/utils/format';
  
  describe('Format utils', () => {
    describe('formatNumber', () => {
      it('should format numbers correctly', () => {
        expect(formatNumber(1000)).toBe('1,000');
        expect(formatNumber(1000000)).toBe('1,000,000');
        expect(formatNumber(1234.56)).toBe('1,234.56');
      });
  
      it('should round to specified decimal places', () => {
        expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
        expect(formatNumber(1234.5678, 0)).toBe('1,235');
      });
    });
  
    describe('formatFileSize', () => {
      it('should format file sizes in bytes correctly', () => {
        expect(formatFileSize(500)).toBe('500 B');
        expect(formatFileSize(1024)).toBe('1.0 KB');
        expect(formatFileSize(1048576)).toBe('1.0 MB');
        expect(formatFileSize(1073741824)).toBe('1.0 GB');
      });
  
      it('should handle decimal places correctly', () => {
        expect(formatFileSize(1536, 1)).toBe('1.5 KB');
        expect(formatFileSize(1536, 2)).toBe('1.50 KB');
      });
    });
  
    describe('truncateText', () => {
      it('should truncate text to specified length', () => {
        const longText = '이 텍스트는 너무 길어서 잘려야 합니다.';
        expect(truncateText(longText, 10)).toBe('이 텍스트는...');
      });
  
      it('should use custom ellipsis if provided', () => {
        const longText = '이 텍스트는 너무 길어서 잘려야 합니다.';
        expect(truncateText(longText, 10, '(...)')).toBe('이 텍스트는(...)');
      });
  
      it('should not truncate text shorter than limit', () => {
        const shortText = '짧은 텍스트';
        expect(truncateText(shortText, 20)).toBe('짧은 텍스트');
      });
    });
  
    describe('formatPhoneNumber', () => {
      it('should format Korean phone numbers correctly', () => {
        expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
        expect(formatPhoneNumber('0212345678')).toBe('02-1234-5678');
        expect(formatPhoneNumber('021234567')).toBe('02-123-4567');
      });
  
      it('should handle numbers with existing hyphens', () => {
        expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678');
      });
  
      it('should handle invalid phone numbers', () => {
        expect(formatPhoneNumber('123')).toBe('123');
        expect(formatPhoneNumber('')).toBe('');
      });
    });
  
    describe('formatCurrency', () => {
      it('should format currency amounts correctly', () => {
        expect(formatCurrency(1000)).toBe('₩1,000');
        expect(formatCurrency(1234.56)).toBe('₩1,235');
      });
  
      it('should use specified currency symbol', () => {
        expect(formatCurrency(1000, '$')).toBe('$1,000');
        expect(formatCurrency(1000, '€')).toBe('€1,000');
      });
  
      it('should handle decimal places correctly', () => {
        expect(formatCurrency(1234.56, '₩', 2)).toBe('₩1,234.56');
      });
    });
  
    describe('capitalize', () => {
      it('should capitalize first letter of a string', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('world')).toBe('World');
      });
  
      it('should handle empty strings', () => {
        expect(capitalize('')).toBe('');
      });
  
      it('should handle already capitalized strings', () => {
        expect(capitalize('Hello')).toBe('Hello');
      });
    });
  });