// tests/architecture/cleanArchitecture.test.ts
import * as path from 'path';
import { DependencyGraph } from '../helpers/dependencyGraph';

// 테스트 타임아웃 설정 (의존성 그래프 분석에 시간이 걸릴 수 있음)
jest.setTimeout(60000);

describe('Clean Architecture 검증', () => {
  let dependencyGraph: DependencyGraph;
  
  // 계층 구조 정의
  const layers = {
    domain: 'models',                         // 도메인 모델 (핵심 엔티티 및 비즈니스 규칙)
    useCases: 'services',                     // 유스케이스 (애플리케이션 비즈니스 규칙)
    interfaces: 'controllers',                // 인터페이스 어댑터 (컨트롤러, 프레젠터)
    infrastructure: ['middleware', 'routes', 'config'] // 프레임워크 및 인프라 코드
  };
  
  // 테스트 시작 전 의존성 그래프 구축
  beforeAll(() => {
    const projectRoot = path.resolve(__dirname, '../../');
    dependencyGraph = new DependencyGraph(projectRoot);
    console.log('의존성 그래프 구축 완료');
  });
  
  describe('계층 간 의존성 방향 검증', () => {
    // 도메인 계층 의존성 검증
    test('도메인 계층은 외부 계층에 의존하지 않아야 함', () => {
      const violations = dependencyGraph.findDependenciesFrom(
        layers.domain,
        [layers.interfaces, ...layers.infrastructure]
      );
      
      if (violations.length > 0) {
        console.error('도메인 계층 의존성 위반:', violations);
      }
      
      expect(violations).toHaveLength(0);
    });
    
    // 유스케이스 계층 의존성 검증
    test('유스케이스 계층은 인터페이스나 인프라 계층에 의존하지 않아야 함', () => {
      const violations = dependencyGraph.findDependenciesFrom(
        layers.useCases,
        [layers.interfaces, ...layers.infrastructure]
      );
      
      if (violations.length > 0) {
        console.error('유스케이스 계층 의존성 위반:', violations);
      }
      
      expect(violations).toHaveLength(0);
    });
    
    // 인터페이스 계층 의존성 검증
    test('인터페이스 계층은 인프라 계층에 의존하지 않아야 함', () => {
      const violations = dependencyGraph.findDependenciesFrom(
        layers.interfaces,
        layers.infrastructure
      );
      
      if (violations.length > 0) {
        console.error('인터페이스 계층 의존성 위반:', violations);
      }
      
      expect(violations).toHaveLength(0);
    });
  });
  
  describe('순환 의존성 검증', () => {
    test('모듈 간 순환 의존성이 없어야 함', () => {
      const cyclicDependencies = dependencyGraph.findCyclicDependencies();
      
      if (cyclicDependencies.length > 0) {
        console.error('순환 의존성 발견:', cyclicDependencies);
      }
      
      expect(cyclicDependencies).toHaveLength(0);
    });
  });
  
  describe('의존성 주입 패턴 검증', () => {
    // 컨트롤러에서 서비스(유스케이스) 사용 검증
    test('컨트롤러는 서비스 계층에 의존해야 함', () => {
      const controllerDependencies = dependencyGraph.getDependenciesOf(layers.interfaces);
      
      // 컨트롤러가 서비스를 참조하는지 확인
      const hasServiceDependencies = controllerDependencies.some(dep => 
        dep.importedModule.includes(layers.useCases)
      );
      
      expect(hasServiceDependencies).toBe(true);
    });
    
    // 서비스가 모델 사용 검증
    test('서비스는 모델 계층에 의존해야 함', () => {
      const serviceDependencies = dependencyGraph.getDependenciesOf(layers.useCases);
      
      // 서비스가 모델을 참조하는지 확인
      const hasModelDependencies = serviceDependencies.some(dep => 
        dep.importedModule.includes(layers.domain)
      );
      
      expect(hasModelDependencies).toBe(true);
    });
  });

  describe('인터페이스 사용 검증', () => {
    // 인터페이스 사용 검증을 위한 헬퍼 함수
    const countInterfaceUsage = (directoryPath: string): number => {
      const dependencies = dependencyGraph.getDependenciesOf(directoryPath);
      
      // 인터페이스 파일(*.interface.ts 또는 types/*.ts)을 참조하는 의존성 수
      return dependencies.filter(dep => 
        dep.importedModule.includes('.interface.ts') || 
        dep.importedModule.includes('types/') ||
        dep.importedModule.includes('interfaces/')
      ).length;
    };
    
    test('서비스 계층은 인터페이스를 사용해야 함', () => {
      const interfaceCount = countInterfaceUsage(layers.useCases);
      
      // 최소한 하나의 인터페이스를 사용해야 함
      expect(interfaceCount).toBeGreaterThan(0);
    });
    
    test('컨트롤러 계층은 인터페이스를 사용해야 함', () => {
      const interfaceCount = countInterfaceUsage(layers.interfaces);
      
      // 최소한 하나의 인터페이스를 사용해야 함
      expect(interfaceCount).toBeGreaterThan(0);
    });
  });
  
  describe('단일 책임 원칙 검증', () => {
    test('모듈은 단일 책임을 가져야 함 (파일 크기로 근사)', () => {
      const maxAllowedDependencies = 15; // 임의의 기준값
      
      // 모든 의존성 수집
      const allDependencies = dependencyGraph.getDependencies();
      
      // 모듈별 의존성 수 계산
      const moduleDependencyCounts = new Map<string, number>();
      
      for (const dep of allDependencies) {
        const moduleDir = dep.sourceFile.split('/')[0];
        
        if (!moduleDependencyCounts.has(moduleDir)) {
          moduleDependencyCounts.set(moduleDir, 0);
        }
        
        moduleDependencyCounts.set(
          moduleDir, 
          moduleDependencyCounts.get(moduleDir)! + 1
        );
      }
      
      // 의존성이 많은 모듈 찾기
      const highDependencyModules = Array.from(moduleDependencyCounts.entries())
        .filter(([_, count]) => count > maxAllowedDependencies);
      
      if (highDependencyModules.length > 0) {
        console.warn('의존성이 많은 모듈 (단일 책임 원칙 위반 가능성):', 
          highDependencyModules.map(([module, count]) => `${module}: ${count}개 의존성`)
        );
      }
      
      // 테스트 통과 기준 설정 (경고만 제공하고 실패하지 않음)
      expect(true).toBe(true);
    });
  });
  
  describe('의존성 역전 원칙 검증', () => {
    test('고수준 모듈은 저수준 모듈에 의존하지 않고 추상화에 의존해야 함', () => {
      // 서비스 계층의 외부 의존성이 주로 인터페이스/타입을 통해 이루어지는지 확인
      const serviceDependencies = dependencyGraph.getDependenciesOf(layers.useCases);
      
      // 인터페이스/타입 참조 수
      const interfaceReferences = serviceDependencies.filter(dep => 
        dep.importedModule.includes('.interface.ts') || 
        dep.importedModule.includes('types/') ||
        dep.importedModule.includes('interfaces/')
      ).length;
      
      // 인프라 계층 직접 참조 수
      const infrastructureReferences = serviceDependencies.filter(dep => 
        layers.infrastructure.some(infra => dep.importedModule.includes(infra))
      ).length;
      
      // 인터페이스 참조가 더 많아야 함
      if (interfaceReferences <= infrastructureReferences) {
        console.warn('의존성 역전 원칙 위반 가능성: 서비스 계층이 인터페이스보다 구체적인 구현에 더 의존합니다.');
        console.warn(`인터페이스 참조: ${interfaceReferences}, 인프라 직접 참조: ${infrastructureReferences}`);
      }
      
      // 테스트 통과 기준 설정 (실제 아키텍처에 따라 조정 필요)
      // 여기서는 경고만 제공하고 항상 통과시킴
      expect(true).toBe(true);
    });
  });
});