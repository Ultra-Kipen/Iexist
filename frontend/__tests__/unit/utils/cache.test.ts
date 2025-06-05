import { 
    setCache, 
    getCache, 
    removeCache, 
    clearCache,
    getCacheKeys,
    getCacheSize,
    isCacheExpired
  } from '../../../src/utils/cache';
  
  describe('Cache utils', () => {
    beforeEach(() => {
      // 각 테스트 전에 캐시 초기화
      clearCache();
    });
  
    describe('setCache and getCache', () => {
      it('should store and retrieve cache items correctly', () => {
        const key = 'testKey';
        const value = { name: '테스트', id: 123 };
        
        setCache(key, value);
        const cachedValue = getCache(key);
        
        expect(cachedValue).toEqual(value);
      });
  
      it('should handle expiration time correctly', () => {
        jest.useFakeTimers();
        
        const key = 'expiringKey';
        const value = 'will expire';
        const ttl = 60; // 60초 후 만료
        
        setCache(key, value, ttl);
        
        // TTL 지나기 전에는 값이 존재해야 함
        expect(getCache(key)).toBe(value);
        
        // TTL 이후에는 값이 null이어야 함
        jest.advanceTimersByTime(ttl * 1000 + 100); // 약간 더 진행
        expect(getCache(key)).toBeNull();
        
        jest.useRealTimers();
      });
    });
  
    describe('removeCache', () => {
      it('should remove specific cache item', () => {
        setCache('key1', 'value1');
        setCache('key2', 'value2');
        
        removeCache('key1');
        
        expect(getCache('key1')).toBeNull();
        expect(getCache('key2')).toBe('value2');
      });
    });
  
    describe('clearCache', () => {
      it('should remove all cache items', () => {
        setCache('key1', 'value1');
        setCache('key2', 'value2');
        
        clearCache();
        
        expect(getCache('key1')).toBeNull();
        expect(getCache('key2')).toBeNull();
      });
    });
  
    describe('getCacheKeys', () => {
      it('should return all cache keys', () => {
        setCache('key1', 'value1');
        setCache('key2', 'value2');
        
        const keys = getCacheKeys();
        
        expect(keys).toContain('key1');
        expect(keys).toContain('key2');
        expect(keys.length).toBe(2);
      });
    });
  
    describe('getCacheSize', () => {
      it('should return correct number of cache items', () => {
        expect(getCacheSize()).toBe(0);
        
        setCache('key1', 'value1');
        expect(getCacheSize()).toBe(1);
        
        setCache('key2', 'value2');
        expect(getCacheSize()).toBe(2);
        
        removeCache('key1');
        expect(getCacheSize()).toBe(1);
        
        clearCache();
        expect(getCacheSize()).toBe(0);
      });
    });
  
    describe('isCacheExpired', () => {
      it('should correctly check if cache is expired', () => {
        jest.useFakeTimers();
        
        const key = 'expiringKey';
        const value = 'will expire';
        const ttl = 60; // 60초 후 만료
        
        setCache(key, value, ttl);
        
        expect(isCacheExpired(key)).toBe(false);
        
        jest.advanceTimersByTime(ttl * 1000 + 100);
        expect(isCacheExpired(key)).toBe(true);
        
        jest.useRealTimers();
      });
  
      it('should return true for non-existent keys', () => {
        expect(isCacheExpired('nonExistentKey')).toBe(true);
      });
    });
  });