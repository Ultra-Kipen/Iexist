// tests/coverage-checker.ts
import * as fs from 'fs';
import * as path from 'path';

// 테스트 커버리지 리포트 위치
const coverageSummaryPath = path.join(__dirname, '../coverage/coverage-summary.json');

// 목표 커버리지 임계값 설정
const thresholds: Record<string, number> = {
  statements: 70,
  branches: 60,
  functions: 70,
  lines: 70
};

// 컬러 출력을 위한 ANSI 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

interface CoverageMetric {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

interface CoverageData {
  [key: string]: CoverageMetric;
}

interface CoverageSummary {
  total: CoverageData;
  [dirName: string]: CoverageData;
}

/**
 * 커버리지 리포트를 확인하고 목표 임계값과 비교
 */
function checkCoverage(): void {
  if (!fs.existsSync(coverageSummaryPath)) {
    console.error(`${colors.red}커버리지 리포트 파일을 찾을 수 없습니다: ${coverageSummaryPath}${colors.reset}`);
    console.log(`${colors.yellow}먼저 커버리지 리포트를 생성하세요: npm run test:coverage${colors.reset}`);
    process.exit(1);
  }

  try {
    const coverageSummary: CoverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    const totalCoverage = coverageSummary.total;

    if (!totalCoverage) {
      console.error(`${colors.red}커버리지 리포트에서 총계를 찾을 수 없습니다.${colors.reset}`);
      process.exit(1);
    }

    console.log(`${colors.blue}=== 테스트 커버리지 요약 ===${colors.reset}`);
    let failed = false;

    // 각 메트릭 확인
    for (const [metric, threshold] of Object.entries(thresholds)) {
      const coverage = totalCoverage[metric].pct;
      const passOrFail = coverage >= threshold ? 
        `${colors.green}통과${colors.reset}` : 
        `${colors.red}실패${colors.reset}`;
      
      console.log(`${metric}: ${coverage}% (목표: ${threshold}%) - ${passOrFail}`);
      
      if (coverage < threshold) {
        failed = true;
      }
    }

    console.log('\n');

    // 디렉토리별 커버리지 출력
    if (coverageSummary) {
      console.log(`${colors.blue}=== 디렉토리별 커버리지 ===${colors.reset}`);
      
      for (const [dirName, coverage] of Object.entries(coverageSummary)) {
        if (dirName !== 'total') {
          console.log(`\n${colors.cyan}${dirName}:${colors.reset}`);
          console.log(`  Statements: ${coverage.statements.pct}%`);
          console.log(`  Branches: ${coverage.branches.pct}%`);
          console.log(`  Functions: ${coverage.functions.pct}%`);
          console.log(`  Lines: ${coverage.lines.pct}%`);
        }
      }
    }

    if (failed) {
      console.log(`\n${colors.red}커버리지가 목표 임계값에 도달하지 못했습니다.${colors.reset}`);
      console.log(`${colors.yellow}테스트 커버리지를 개선하세요.${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`\n${colors.green}모든 커버리지 목표를 달성했습니다!${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}커버리지 리포트 파싱 중 오류가 발생했습니다:${colors.reset}`, error);
    process.exit(1);
  }
}

// 메인 실행
checkCoverage();