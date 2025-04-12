// tests/utils/cache.test.ts


// 간단한 메모리 캐시 클래스
class MemoryCache {
  private cache: Map<string, any>;
  private ttls: Map<string, number>;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  // 캐시에 데이터 저장
  set(key: string, value: any, ttl: number = 60000): void {
    this.cache.set(key, value);
    const expiry = Date.now() + ttl;
    this.ttls.set(key, expiry);
  }

  // 캐시에서 데이터 가져오기
  get(key: string): any {
    // 만료 확인
    const expiry = this.ttls.get(key);
    if (expiry && expiry < Date.now()) {
      // 만료된 항목 제거
      this.delete(key);
      this.missCount++;
      return undefined;
    }
    
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.hitCount++;
    } else {
      this.missCount++;
    }
    return value;
  }

  // 캐시에서 데이터 삭제
  delete(key: string): boolean {
    this.ttls.delete(key);
    return this.cache.delete(key);
  }

  // 캐시 비우기
  clear(): void {
    this.cache.clear();
    this.ttls.clear();
    this.resetMetrics();
  }

  // 캐시 크기
  size(): number {
    return this.cache.size;
  }
  
  // 특정 패턴과 일치하는 키 삭제
  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }
    
    return count;
  }
  
  // 히트율 계산
  getHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }
  
  // 히트 수 가져오기
  getHitCount(): number {
    return this.hitCount;
  }
  
  // 미스 수 가져오기
  getMissCount(): number {
    return this.missCount;
  }
  
  // 메트릭 초기화
  resetMetrics(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }
}

// 분산 캐시 시뮬레이션을 위한 클래스
class DistributedCache {
  private localCache: MemoryCache;
  private remoteCaches: MemoryCache[] = [];
  
  constructor() {
    this.localCache = new MemoryCache();
  }
  
  // 원격 캐시 인스턴스 추가
  addRemoteCache(cache: MemoryCache): void {
    this.remoteCaches.push(cache);
  }
  
  // 모든 캐시 인스턴스에 데이터 저장
  set(key: string, value: any, ttl: number = 60000): void {
    // 로컬 캐시에 저장
    this.localCache.set(key, value, ttl);
    
    // 원격 캐시에도 저장 (실제 환경에서는 비동기로 처리)
    for (const cache of this.remoteCaches) {
      cache.set(key, value, ttl);
    }
  }
  
  // 로컬 캐시에서 먼저 조회 후 없으면 원격 캐시 조회
  get(key: string): any {
    // 로컬 캐시 먼저 확인
    const localValue = this.localCache.get(key);
    if (localValue !== undefined) {
      return localValue;
    }
    
    // 로컬 캐시에 없으면 원격 캐시 확인
    for (const cache of this.remoteCaches) {
      const remoteValue = cache.get(key);
      if (remoteValue !== undefined) {
        // 원격 캐시에서 찾았으면 로컬 캐시에도 저장
        this.localCache.set(key, remoteValue);
        return remoteValue;
      }
    }
    
    return undefined;
  }
  
  // 모든 캐시에서 키 삭제
  delete(key: string): boolean {
    let result = this.localCache.delete(key);
    
    // 원격 캐시에서도 삭제
    for (const cache of this.remoteCaches) {
      result = cache.delete(key) || result;
    }
    
    return result;
  }
  
  // 모든 캐시 비우기
  clear(): void {
    this.localCache.clear();
    for (const cache of this.remoteCaches) {
      cache.clear();
    }
  }
}

// 캐시 인스턴스
const cache = new MemoryCache();

describe('메모리 캐시 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전에 캐시 초기화
    cache.clear();
  });

  // 필수 테스트 항목
  test('데이터를 캐시에 저장하고 가져올 수 있어야 함', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  test('존재하지 않는 키는 undefined를 반환해야 함', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  test('캐시된 데이터를 삭제할 수 있어야 함', () => {
    cache.set('key1', 'value1');
    expect(cache.delete('key1')).toBe(true);
    expect(cache.get('key1')).toBeUndefined();
  });

  test('만료된 캐시 항목은 가져올 수 없어야 함', async () => {
    // 짧은 TTL로 설정
    cache.set('expiring', 'value', 50);
    expect(cache.get('expiring')).toBe('value');
    
    // 만료 대기
    await new Promise(resolve => setTimeout(resolve, 60));
    
    // 만료 후 확인
    expect(cache.get('expiring')).toBeUndefined();
  });

  test('캐시를 완전히 비울 수 있어야 함', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);
    
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  // 추천 테스트 항목
  test('다양한 타입의 데이터를 캐싱할 수 있어야 함', () => {
    // 문자열
    cache.set('string', 'test string');
    expect(cache.get('string')).toBe('test string');
    
    // 숫자
    cache.set('number', 12345);
    expect(cache.get('number')).toBe(12345);
    
    // 객체
    const testObj = { name: '테스트', value: 42 };
    cache.set('object', testObj);
    expect(cache.get('object')).toEqual(testObj);
    
    // 배열
    const testArray = [1, 2, 3, 4, 5];
    cache.set('array', testArray);
    expect(cache.get('array')).toEqual(testArray);
  });

  test('동일한 키로 여러 번 설정하면 값을 덮어써야 함', () => {
    cache.set('key', 'value1');
    expect(cache.get('key')).toBe('value1');
    
    cache.set('key', 'value2');
    expect(cache.get('key')).toBe('value2');
  });

  test('TTL 없이 설정된 항목은 기본 만료 시간을 사용해야 함', async () => {
    cache.set('defaultTTL', 'value');
    expect(cache.get('defaultTTL')).toBe('value');
    
    // 기본 TTL은 60000ms이므로 50ms 후에는 만료되지 않아야 함
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(cache.get('defaultTTL')).toBe('value');
  });

  test('존재하지 않는 키 삭제 시 false를 반환해야 함', () => {
    expect(cache.delete('nonexistent')).toBe(false);
  });

  test('대량의 데이터 캐싱 처리 성능 테스트', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      cache.set(`key${i}`, `value${i}`);
    }
    const end = Date.now();
    
    expect(cache.size()).toBe(1000);
    console.log(`1000개 항목 캐싱 소요 시간: ${end - start}ms`);
    
    // 성능 테스트이므로 시간 제한은 하지 않음
    // 단, 로깅을 통해 성능 문제 식별 가능
  });
  
  // 새로 추가된 테스트: 패턴 기반 캐시 무효화
  test('특정 패턴과 일치하는 키를 일괄 삭제할 수 있어야 함', () => {
    // 특정 패턴의 키로 여러 데이터 캐싱
    cache.set('user:1:profile', { name: '사용자1' });
    cache.set('user:1:preferences', { theme: 'dark' });
    cache.set('user:2:profile', { name: '사용자2' });
    cache.set('post:1', { title: '게시물1' });
    
    // user:1 관련 캐시만 무효화
    const invalidatedCount = cache.invalidatePattern('^user:1:');
    
    // 삭제된 항목 수 확인
    expect(invalidatedCount).toBe(2);
    
    // 무효화된 캐시 확인
    expect(cache.get('user:1:profile')).toBeUndefined();
    expect(cache.get('user:1:preferences')).toBeUndefined();
    
    // 다른 캐시는 유지되어야 함
    expect(cache.get('user:2:profile')).toBeDefined();
    expect(cache.get('post:1')).toBeDefined();
  });
  
  // 새로 추가된 테스트: 캐시 히트율 측정
  test('캐시 히트율이 올바르게 계산되어야 함', () => {
    // 초기 히트율은 0%
    expect(cache.getHitRate()).toBe(0);
    
    // 캐시 설정
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    // 히트 발생
    cache.get('key1');
    cache.get('key1');
    cache.get('key2');
    
    // 미스 발생
    cache.get('key3');
    cache.get('key4');
    
    // 히트율 계산: 3/(3+2) = 0.6
    expect(cache.getHitRate()).toBeCloseTo(0.6);
    expect(cache.getHitCount()).toBe(3);
    expect(cache.getMissCount()).toBe(2);
    
    // 메트릭 초기화
    cache.resetMetrics();
    expect(cache.getHitRate()).toBe(0);
    expect(cache.getHitCount()).toBe(0);
    expect(cache.getMissCount()).toBe(0);
  });
});

// 동적 생성 데이터와 캐시 연동 테스트
describe('데이터 생성 및 캐시 연동 테스트', () => {
  // 데이터 생성 함수 모의
  const generateData = jest.fn((id: number) => ({
    id,
    name: `Item ${id}`,
    timestamp: Date.now()
  }));
  
  // 캐시 래핑 함수
  const getData = (id: number) => {
    const cacheKey = `data:${id}`;
    let data = cache.get(cacheKey);
    
    if (!data) {
      // 캐시 미스: 데이터 생성
      data = generateData(id);
      cache.set(cacheKey, data);
    }
    
    return data;
  };
  
  // 데이터 업데이트 함수
  const updateData = (id: number, updates: object) => {
    const cacheKey = `data:${id}`;
    let data = cache.get(cacheKey);
    
    if (data) {
      // 기존 데이터가 있으면 업데이트
      data = { ...data, ...updates, updatedAt: Date.now() };
      cache.set(cacheKey, data);
    } else {
      // 없으면 새로 생성
      data = { ...generateData(id), ...updates, updatedAt: Date.now() };
      cache.set(cacheKey, data);
    }
    
    return data;
  };
  
  beforeEach(() => {
    cache.clear();
    generateData.mockClear();
  });
  
  test('캐시 미스 시 데이터를 생성하고 캐싱해야 함', () => {
    const data = getData(1);
    
    expect(data.id).toBe(1);
    expect(data.name).toBe('Item 1');
    expect(generateData).toHaveBeenCalledTimes(1);
  });
  
  test('캐시 히트 시 데이터 생성 없이 캐시된 데이터를 반환해야 함', () => {
    // 첫 번째 호출: 캐시 미스
    const data1 = getData(2);
    expect(generateData).toHaveBeenCalledTimes(1);
    
    // 두 번째 호출: 캐시 히트
    const data2 = getData(2);
    expect(generateData).toHaveBeenCalledTimes(1); // 추가 호출 없음
    
    // 동일한 데이터가 반환되어야 함
    expect(data2).toEqual(data1);
  });
  
  test('여러 ID에 대한 데이터 요청은 각각 캐싱되어야 함', () => {
    getData(3);
    getData(4);
    getData(5);
    
    expect(generateData).toHaveBeenCalledTimes(3);
    
    // 동일한 ID 다시 요청: 캐시 히트
    getData(3);
    getData(4);
    getData(5);
    
    // 추가 호출 없음
    expect(generateData).toHaveBeenCalledTimes(3);
  });
  
  // 새로 추가된 테스트: 데이터 변경 시 캐시 무효화
  test('데이터 업데이트 시 캐시가 정확히 갱신되어야 함', () => {
    // 초기 데이터 캐싱
    const data1 = getData(10);
    expect(data1.name).toBe('Item 10');
    expect(generateData).toHaveBeenCalledTimes(1);
    
    // 데이터 업데이트
    const updatedData = updateData(10, { name: '수정된 항목 10' });
    expect(updatedData.name).toBe('수정된 항목 10');
    
    // 다시 조회 시 업데이트된 데이터가 반환되어야 함
    const data2 = getData(10);
    expect(data2.name).toBe('수정된 항목 10');
    
    // 데이터 생성 함수가 다시 호출되지 않아야 함
    expect(generateData).toHaveBeenCalledTimes(1);
  });
});

// 분산 캐시 테스트 추가
describe('분산 캐시 테스트', () => {
  const distributedCache = new DistributedCache();
  const remoteCache1 = new MemoryCache();
  const remoteCache2 = new MemoryCache();
  
  beforeEach(() => {
    distributedCache.clear();
    remoteCache1.clear();
    remoteCache2.clear();
    distributedCache.addRemoteCache(remoteCache1);
    distributedCache.addRemoteCache(remoteCache2);
  });
  
  test('분산 캐시가 모든 인스턴스에 데이터를 복제해야 함', () => {
    // 분산 캐시에 데이터 저장
    distributedCache.set('shared-key', 'shared-value');
    
    // 모든 캐시 인스턴스에서 데이터를 조회할 수 있어야 함
    expect(remoteCache1.get('shared-key')).toBe('shared-value');
    expect(remoteCache2.get('shared-key')).toBe('shared-value');
  });
  
  test('로컬 캐시 미스 시 원격 캐시에서 데이터를 조회할 수 있어야 함', () => {
    // 원격 캐시에만 데이터 저장
    remoteCache1.set('remote-key', 'remote-value');
    
    // 분산 캐시를 통해 데이터 조회
    const value = distributedCache.get('remote-key');
    
    // 원격 캐시에서 데이터를 찾아 반환해야 함
    expect(value).toBe('remote-value');
  });
  
  test('분산 캐시에서 키 삭제 시 모든 인스턴스에서 삭제되어야 함', () => {
    // 모든 캐시에 데이터 설정
    distributedCache.set('delete-key', 'delete-value');
    
    // 모든 인스턴스에 데이터가 있는지 확인
    expect(remoteCache1.get('delete-key')).toBe('delete-value');
    expect(remoteCache2.get('delete-key')).toBe('delete-value');
    
    // 분산 캐시에서 키 삭제
    distributedCache.delete('delete-key');
    
    // 모든 인스턴스에서 삭제되었는지 확인
    expect(remoteCache1.get('delete-key')).toBeUndefined();
    expect(remoteCache2.get('delete-key')).toBeUndefined();
  });
});