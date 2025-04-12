/**
 * 간단한 인메모리 캐시 구현
 */
export interface CacheOptions {
    /** 캐시 유효 시간 (밀리초) */
    ttl?: number;
    /** 최대 캐시 항목 수 */
    maxSize?: number;
  }
  
  interface CacheItem<T> {
    value: T;
    timestamp: number;
  }
  
  export class MemoryCache {
    private cache: Map<string, CacheItem<any>> = new Map();
    private ttl: number;
    private maxSize: number;
  
    constructor(options: CacheOptions = {}) {
      this.ttl = options.ttl || 5 * 60 * 1000; // 기본 5분
      this.maxSize = options.maxSize || 100; // 기본 100개 항목
    }
  
    /**
     * 캐시에 항목 설정
     * @param key 캐시 키
     * @param value 캐시할 값
     * @param ttl 특정 항목의 TTL (옵션)
     */
    set<T>(key: string, value: T, ttl?: number): void {
      // 캐시 크기 제한 초과 시 가장 오래된 항목 제거
      if (this.cache.size >= this.maxSize) {
        const oldestKey = this.getOldestKey();
        if (oldestKey) {
          this.cache.delete(oldestKey);
        }
      }
  
      this.cache.set(key, {
        value,
        timestamp: Date.now() + (ttl || this.ttl),
      });
    }
  
    /**
     * 캐시에서 항목 가져오기
     * @param key 캐시 키
     * @returns 캐시된 값 또는 undefined
     */
    get<T>(key: string): T | undefined {
      const item = this.cache.get(key);
      
      // 항목이 없거나 만료된 경우
      if (!item || Date.now() > item.timestamp) {
        if (item) {
          this.cache.delete(key); // 만료된 항목 제거
        }
        return undefined;
      }
      
      return item.value as T;
    }
  
    /**
     * 캐시에서 항목 삭제
     * @param key 캐시 키
     */
    delete(key: string): boolean {
      return this.cache.delete(key);
    }
  
    /**
     * 모든 캐시 항목 삭제
     */
    clear(): void {
      this.cache.clear();
    }
  
    /**
     * 만료된 모든 캐시 항목 삭제
     */
    cleanup(): void {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.timestamp) {
          this.cache.delete(key);
        }
      }
    }
  
    /**
     * 가장 오래된 캐시 키 반환
     */
    private getOldestKey(): string | null {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
  
      for (const [key, item] of this.cache.entries()) {
        if (item.timestamp < oldestTime) {
          oldestTime = item.timestamp;
          oldestKey = key;
        }
      }
  
      return oldestKey;
    }
  
    /**
     * 현재 캐시 크기 반환
     */
    get size(): number {
      return this.cache.size;
    }
  }
  
  // 전역 캐시 인스턴스
  export const globalCache = new MemoryCache();