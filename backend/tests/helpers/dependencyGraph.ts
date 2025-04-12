// tests/helpers/dependencyGraph.ts
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface Dependency {
  sourceFile: string;
  importedModule: string;
}

export class DependencyGraph {
  private dependencies: Dependency[] = [];
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = path.resolve(baseDir);
    this.buildDependencyGraph();
  }

  private buildDependencyGraph(): void {
    const files = this.getAllTsFiles(this.baseDir);
    
    for (const file of files) {
      this.processFile(file);
    }
  }

  private getAllTsFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        results = results.concat(this.getAllTsFiles(filePath));
      } else if (path.extname(filePath) === '.ts' || path.extname(filePath) === '.tsx') {
        // node_modules와 테스트 파일 제외
        if (!filePath.includes('node_modules') && 
            !filePath.includes('.test.ts') &&
            !filePath.includes('.spec.ts') &&
            !filePath.includes('__tests__')) {
          results.push(filePath);
        }
      }
    }
    
    return results;
  }

  private processFile(filePath: string): void {
    const sourceFile = ts.createSourceFile(
      filePath,
      fs.readFileSync(filePath, 'utf-8'),
      ts.ScriptTarget.ES2020,
      true
    );

    // 파일 내의 import 문 추출
    this.extractImports(sourceFile, filePath);
  }

  private extractImports(sourceFile: ts.SourceFile, filePath: string): void {
    sourceFile.forEachChild(node => {
      if (ts.isImportDeclaration(node)) {
        const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
        
        // 상대 경로 import만 처리 (외부 패키지는 제외)
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
          const resolvedPath = this.resolveImportPath(filePath, importPath);
          
          this.dependencies.push({
            sourceFile: this.normalizePath(filePath),
            importedModule: this.normalizePath(resolvedPath)
          });
        }
      }
    });
  }

  private resolveImportPath(sourceFilePath: string, importPath: string): string {
    // 상대 경로를 절대 경로로 변환
    const sourceDir = path.dirname(sourceFilePath);
    let resolvedPath = path.resolve(sourceDir, importPath);
    
    // 확장자가 없는 경우 추가 (TS/TSX 우선)
    if (!path.extname(resolvedPath)) {
      const extensions = ['.ts', '.tsx', '.js', '.jsx'];
      
      for (const ext of extensions) {
        const pathWithExt = resolvedPath + ext;
        if (fs.existsSync(pathWithExt)) {
          return pathWithExt;
        }
      }
      
      // 디렉토리인 경우 index 파일 확인
      for (const ext of extensions) {
        const indexPath = path.join(resolvedPath, `index${ext}`);
        if (fs.existsSync(indexPath)) {
          return indexPath;
        }
      }
    }
    
    return resolvedPath;
  }

  // 경로 정규화 (OS 간 차이 제거 및 프로젝트 기준 상대 경로로 변환)
  private normalizePath(filePath: string): string {
    // 절대 경로를 프로젝트 루트 기준 상대 경로로 변환
    let relativePath = path.relative(this.baseDir, filePath);
    
    // 경로 구분자 통일 (Windows에서도 UNIX 스타일 사용)
    return relativePath.replace(/\\/g, '/');
  }

  // 계층 간 의존성 검증 메서드
  public findDependenciesFrom(sourcePath: string, targetPaths: string[]): Dependency[] {
    const violations: Dependency[] = [];
    
    for (const dep of this.dependencies) {
      // 소스 경로로 시작하는 파일만 확인
      if (dep.sourceFile.startsWith(sourcePath)) {
        // 대상 경로에 해당하는 임포트가 있는지 확인
        for (const targetPath of targetPaths) {
          if (dep.importedModule.startsWith(targetPath)) {
            violations.push(dep);
            break;
          }
        }
      }
    }
    
    return violations;
  }

  // 순환 의존성 검증 메서드
  public findCyclicDependencies(): string[][] {
    const graph: Record<string, string[]> = {};
    
    // 그래프 구축
    for (const dep of this.dependencies) {
      if (!graph[dep.sourceFile]) {
        graph[dep.sourceFile] = [];
      }
      
      if (!graph[dep.importedModule]) {
        graph[dep.importedModule] = [];
      }
      
      if (!graph[dep.sourceFile].includes(dep.importedModule)) {
        graph[dep.sourceFile].push(dep.importedModule);
      }
    }
    
    // 사이클 검색
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();
    
    const dfs = (node: string, path: string[] = []): void => {
      if (stack.has(node)) {
        // 사이클 발견
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart);
          cycle.push(node); // 사이클 완성
          cycles.push(cycle);
        }
        return;
      }
      
      if (visited.has(node)) {
        return;
      }
      
      visited.add(node);
      stack.add(node);
      path.push(node);
      
      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        dfs(neighbor, [...path]);
      }
      
      stack.delete(node);
    };
    
    // 모든 노드에 대해 DFS 실행
    for (const node of Object.keys(graph)) {
      dfs(node);
    }
    
    return cycles;
  }

  // 모듈별 의존성 리스트 반환
  public getDependencies(): Dependency[] {
    return this.dependencies;
  }

  // 특정 모듈의 의존성 반환
  public getDependenciesOf(modulePath: string): Dependency[] {
    return this.dependencies.filter(dep => 
      dep.sourceFile === modulePath || dep.sourceFile.startsWith(`${modulePath}/`)
    );
  }
}