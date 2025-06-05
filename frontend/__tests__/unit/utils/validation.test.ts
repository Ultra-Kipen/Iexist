import { 
    isValidEmail, 
    isValidPassword, 
    isValidUsername,
    isValidPhoneNumber,
    isRequired,
    minLength,
    maxLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber
  } from '../../../src/utils/validation';
  
  describe('Validation utils', () => {
    describe('isValidEmail', () => {
      it('should validate correct email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.kr')).toBe(true);
        expect(isValidEmail('user+tag@example.org')).toBe(true);
      });
  
      it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('invalid@')).toBe(false);
        expect(isValidEmail('@domain.com')).toBe(false);
        expect(isValidEmail('user@domain')).toBe(false);
        expect(isValidEmail('')).toBe(false);
      });
    });
  
    describe('isValidPassword', () => {
      it('should validate strong passwords', () => {
        expect(isValidPassword('Password123!')).toBe(true);
        expect(isValidPassword('Abcde12345@')).toBe(true);
      });
  
      it('should reject weak passwords', () => {
        expect(isValidPassword('password')).toBe(false); // No uppercase, no number, no special char
        expect(isValidPassword('Password')).toBe(false); // No number, no special char
        expect(isValidPassword('password123')).toBe(false); // No uppercase, no special char
        expect(isValidPassword('Pass1!')).toBe(false); // Too short
        expect(isValidPassword('')).toBe(false);
      });
    });
  
    describe('isValidUsername', () => {
      it('should validate correct usernames', () => {
        expect(isValidUsername('user123')).toBe(true);
        expect(isValidUsername('user_name')).toBe(true);
        expect(isValidUsername('User-Name')).toBe(true);
      });
  
      it('should reject invalid usernames', () => {
        expect(isValidUsername('us')).toBe(false); // Too short
        expect(isValidUsername('user name')).toBe(false); // Contains space
        expect(isValidUsername('user@name')).toBe(false); // Contains special char
        expect(isValidUsername('verylongusernamethatisover30characters')).toBe(false); // Too long
        expect(isValidUsername('')).toBe(false);
      });
    });
  
    describe('isValidPhoneNumber', () => {
      it('should validate correct Korean phone numbers', () => {
        expect(isValidPhoneNumber('01012345678')).toBe(true);
        expect(isValidPhoneNumber('010-1234-5678')).toBe(true);
        expect(isValidPhoneNumber('02-123-4567')).toBe(true);
      });
  
      it('should reject invalid phone numbers', () => {
        expect(isValidPhoneNumber('0101234')).toBe(false); // Too short
        expect(isValidPhoneNumber('010-1234-567')).toBe(false); // Invalid format
        expect(isValidPhoneNumber('abc1234567')).toBe(false); // Contains non-numeric chars
        expect(isValidPhoneNumber('')).toBe(false);
      });
    });

    describe('isRequired', () => {
        it('should validate non-empty values', () => {
          expect(isRequired('text')).toBe(true);
          expect(isRequired(0)).toBe(true);
          expect(isRequired(false)).toBe(true);
        });
    
        it('should reject empty values', () => {
          expect(isRequired('')).toBe(false);
          expect(isRequired(null)).toBe(false);
          expect(isRequired(undefined)).toBe(false);
        });
      });
    
      describe('minLength', () => {
        it('should validate strings of sufficient length', () => {
          const validator = minLength(5);
          expect(validator('12345')).toBe(true);
          expect(validator('123456')).toBe(true);
        });
    
        it('should reject strings that are too short', () => {
          const validator = minLength(5);
          expect(validator('1234')).toBe(false);
          expect(validator('')).toBe(false);
        });
      });
    
      describe('maxLength', () => {
        it('should validate strings that are not too long', () => {
          const validator = maxLength(5);
          expect(validator('12345')).toBe(true);
          expect(validator('1234')).toBe(true);
          expect(validator('')).toBe(true);
        });
    
        it('should reject strings that are too long', () => {
          const validator = maxLength(5);
          expect(validator('123456')).toBe(false);
        });
      });
    
      describe('hasUpperCase', () => {
        it('should validate strings with uppercase letters', () => {
          expect(hasUpperCase('Password')).toBe(true);
          expect(hasUpperCase('pAssword')).toBe(true);
        });
    
        it('should reject strings without uppercase letters', () => {
          expect(hasUpperCase('password')).toBe(false);
          expect(hasUpperCase('123456')).toBe(false);
          expect(hasUpperCase('')).toBe(false);
        });
      });
    
      describe('hasLowerCase', () => {
        it('should validate strings with lowercase letters', () => {
          expect(hasLowerCase('Password')).toBe(true);
          expect(hasLowerCase('PASSWORd')).toBe(true);
        });
    
        it('should reject strings without lowercase letters', () => {
          expect(hasLowerCase('PASSWORD')).toBe(false);
          expect(hasLowerCase('123456')).toBe(false);
          expect(hasLowerCase('')).toBe(false);
        });
      });
    
      describe('hasNumber', () => {
        it('should validate strings with numbers', () => {
          expect(hasNumber('Password1')).toBe(true);
          expect(hasNumber('1Password')).toBe(true);
        });
    
        it('should reject strings without numbers', () => {
          expect(hasNumber('Password')).toBe(false);
          expect(hasNumber('')).toBe(false);
        });
      });
    });