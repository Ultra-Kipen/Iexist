// setupTests.js
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');

let backendProcess;
let closeListener;
let errorListener;

// 존재하지 않는 API 엔드포인트 목록 (로그에서 제외할 경로)
const ignoredEndpoints = [
  '/api/users/goals',
  '/api/notifications/unread/count',
  '/api/goals',
  '/api/stats/emotions',
  '/api/comfort-wall/',
  '/api/comfort-walls/',
  '/api/users/notifications/unread',
  '/api/users/stats',
  '/api/stats/activities',
  '/api/stats/emotions/analysis',
  '/api/tags/',
  '/api/emotions/analysis',
  '/api/emotions/',
  '/api/users/statistics',
  '/api/users/settings/notifications',
  '/api/notifications/read-all',
  '/api/notifications/all',
  '/api/notifications/test-trigger',
  '/api/test/notifications',
  '/api/someone-day/'
];

// 로그 필터링 함수
const filterLog = (log) => {
  if (log.includes('404 Not Found:')) {
    // 무시할 엔드포인트인지 확인
    for (const endpoint of ignoredEndpoints) {
      if (log.includes(endpoint)) {
        return false; // 로그에서 제외
      }
    }
  }
  return true; // 로그 유지
};

// 포트가 사용 중인지 확인하는 함수
const isPortInUse = (port) => {
  try {
    // Linux/Mac
    if (process.platform !== 'win32') {
      execSync(`lsof -i:${port} -t`);
      return true;
    }
    // Windows
    else {
      const result = execSync(`netstat -ano | findstr :${port}`).toString();
      return result.length > 0;
    }
  } catch (e) {
    return false;
  }
};

// cross-env가 설치되어 있는지 확인하는 함수
const isCrossEnvAvailable = (backendPath) => {
  try {
    // package.json에서 cross-env 확인
    const packageJson = require(path.join(backendPath, 'package.json'));
    const hasDevDependency = packageJson.devDependencies && packageJson.devDependencies['cross-env'];
    const hasDependency = packageJson.dependencies && packageJson.dependencies['cross-env'];
    
    if (hasDevDependency || hasDependency) {
      // npx를 통해 cross-env 실행 가능한지 확인
      try {
        execSync('npx cross-env --version', { cwd: backendPath, stdio: 'ignore' });
        return { available: true, method: 'npx' };
      } catch (e) {
        console.log('npx cross-env를 사용할 수 없습니다. 직접 설치 확인을 시도합니다.');
      }
    }
    
    // 전역 설치 확인
    try {
      execSync('cross-env --version', { stdio: 'ignore' });
      return { available: true, method: 'global' };
    } catch (e) {
      console.log('전역 cross-env를 사용할 수 없습니다.');
    }
    
    return { available: false, method: null };
  } catch (error) {
    console.log('cross-env 확인 중 오류:', error.message);
    return { available: false, method: null };
  }
};

// 운영체제별 명령어 생성 함수
const createStartCommand = (backendPath) => {
  const crossEnvStatus = isCrossEnvAvailable(backendPath);
  
  if (crossEnvStatus.available) {
    console.log(`cross-env 사용 가능 (방법: ${crossEnvStatus.method})`);
    
    if (crossEnvStatus.method === 'npx') {
      // npx를 통한 실행
      return {
        command: 'npx',
        args: ['cross-env', 'NODE_ENV=test', 'npm', 'run', 'dev'],
        description: 'npx cross-env NODE_ENV=test npm run dev'
      };
    } else {
      // 전역 설치된 cross-env 사용
      return {
        command: 'cross-env',
        args: ['NODE_ENV=test', 'npm', 'run', 'dev'],
        description: 'cross-env NODE_ENV=test npm run dev'
      };
    }
  } else {
    console.log('cross-env를 사용할 수 없습니다. 운영체제별 대안을 사용합니다.');
    
    // 운영체제별 환경변수 설정 방법
    if (process.platform === 'win32') {
      // Windows CMD
      return {
        command: 'cmd',
        args: ['/c', 'set NODE_ENV=test && npm run dev'],
        description: 'set NODE_ENV=test && npm run dev (Windows CMD)'
      };
    } else {
      // Linux/Mac
      return {
        command: 'sh',
        args: ['-c', 'NODE_ENV=test npm run dev'],
        description: 'NODE_ENV=test npm run dev (Linux/Mac)'
      };
    }
  }
};

// 데이터베이스 구성 확인 및 조정
const checkAndUpdateDbConfig = async () => {
  try {
    const backendPath = path.resolve(__dirname, '../backend');
    const configPath = path.join(backendPath, 'config', 'database.ts');
    const envPath = path.join(backendPath, '.env');
    
    // .env 파일이 존재하는지 확인
    if (fs.existsSync(envPath)) {
      console.log('.env 파일 존재함, 테스트 환경을 위한 설정 확인...');
      
      // .env 파일 내용 읽기
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // 테스트용 데이터베이스 설정을 위한 변수들이 있는지 확인
      const testDbConfigExists = envContent.includes('DB_TEST_NAME') && 
                               envContent.includes('DB_TEST_USER') && 
                               envContent.includes('DB_TEST_PASSWORD');
      
      if (!testDbConfigExists) {
        console.log('테스트 데이터베이스 설정이 없습니다. 기본 설정을 사용합니다.');
        
        // 기본 테스트용 데이터베이스 설정 추가
        const testDbConfig = `
# 테스트 데이터베이스 설정
DB_TEST_HOST=localhost
DB_TEST_USER=root
DB_TEST_PASSWORD=
DB_TEST_NAME=iexist_test
DB_TEST_PORT=3306
`;
        
        fs.appendFileSync(envPath, testDbConfig);
        console.log('테스트 데이터베이스 설정을 .env 파일에 추가했습니다.');
      }
    } else {
      console.log('.env 파일이 존재하지 않습니다. 테스트용 기본 설정을 생성합니다.');
      
      // 기본 .env 파일 생성
      const defaultEnv = `# 서버 설정
PORT=3000
NODE_ENV=test

# 데이터베이스 설정 (실제 운영 DB)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=iexist
DB_PORT=3306

# 테스트 데이터베이스 설정
DB_TEST_HOST=localhost
DB_TEST_USER=root
DB_TEST_PASSWORD=
DB_TEST_NAME=iexist_test
DB_TEST_PORT=3306

# JWT 설정
JWT_SECRET=test_secret_key
JWT_EXPIRATION=24h
`;
      
      fs.writeFileSync(envPath, defaultEnv);
      console.log('기본 .env 파일을 생성했습니다.');
    }
    
    console.log('데이터베이스 설정 확인 완료');
  } catch (error) {
    console.error('데이터베이스 설정 확인 중 오류:', error.message);
  }
};

// 백엔드 서버 진단을 위한 함수
const diagnoseBackendServer = async () => {
  try {
    console.log('백엔드 서버 API 진단을 시작합니다...');
    
    // 기본 서버 접속 가능 여부 확인
    try {
      const response = await axios.get('http://localhost:3000', { timeout: 3000 });
      console.log('백엔드 루트 경로 접속 성공:', response.status);
    } catch (error) {
      if (error.response) {
        console.log('백엔드 루트 경로 응답:', error.response.status);
      } else {
        console.log('백엔드 루트 경로 접속 실패:', error.message);
      }
    }
    
    // 사용 가능한 API 경로 목록 확인 (가능한 경우)
    try {
      const response = await axios.get('http://localhost:3000/api', { timeout: 3000 });
      console.log('API 목록 조회 성공:', response.status);
    } catch (error) {
      if (error.response) {
        console.log('API 경로 응답:', error.response.status);
      } else {
        console.log('API 목록 조회 실패:', error.message);
      }
    }
    
    console.log('백엔드 서버 진단 완료');
  } catch (error) {
    console.error('백엔드 서버 진단 중 오류:', error.message);
  }
};

// 서버가 실행 중인지 확인하는 함수
const waitForServer = async (maxRetries = 20, retryDelay = 1000) => {
  // 여러 가능한 엔드포인트 시도 - 실제 존재하는 엔드포인트만 포함
  const endpoints = [
    'http://localhost:3000',            // 루트 경로
    'http://localhost:3000/api',        // API 기본 경로
    'http://localhost:3000/api/status'  // 상태 확인 엔드포인트 (있는 경우)
  ];
  
  let retries = 0;
  
  while (retries < maxRetries) {
    // 모든 가능한 엔드포인트 시도
    for (const url of endpoints) {
      try {
        await axios.get(url, { timeout: 3000 });
        console.log(`서버 ${url}에 연결 성공!`);
        return true;
      } catch (error) {
        // 서버가 실행 중이지만 404 에러가 발생하는 경우 (엔드포인트는 없지만 서버는 실행 중)
        if (error.response && error.response.status) {
          console.log(`서버가 ${url}에 응답했지만 상태 코드는 ${error.response.status}입니다. 서버가 실행 중입니다.`);
          return true;
        }
        // 다음 엔드포인트 시도
      }
    }
    
    // 모든 엔드포인트 시도 실패, 재시도
    retries++;
    if (retries === maxRetries) {
      console.error(`서버 연결 실패: 최대 재시도 횟수 초과`);
      return false;
    }
    console.log(`서버 연결 시도 중... (${retries}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
  
  return false;
};

// 테스트 시작 전 백엔드 서버 실행
beforeAll(async () => {
  console.log('백엔드 서버를 시작합니다...');
  
  // 데이터베이스 설정 확인 및 업데이트
  await checkAndUpdateDbConfig();
  
  // 포트가 이미 사용 중인지 확인
  const port = 3000;
  if (isPortInUse(port)) {
    console.log(`포트 ${port}가 이미 사용 중입니다. 서버가 이미 실행 중인지 확인합니다...`);
    
    // 이미 실행 중인 서버가 백엔드 서버인지 확인
    try {
      for (const url of ['http://localhost:3000', 'http://localhost:3000/api']) {
        try {
          await axios.get(url, { timeout: 2000 });
          console.log(`서버가 ${url}에 응답합니다. 기존 서버를 사용합니다.`);
          // 서버가 실행 중이므로 진단 실행
          await diagnoseBackendServer();
          return; // 서버가 이미 실행 중이므로 여기서 종료
        } catch (error) {
          if (error.response) {
            console.log(`서버가 ${url}에 응답합니다. 기존 서버를 사용합니다.`);
            // 서버가 실행 중이므로 진단 실행
            await diagnoseBackendServer();
            return; // 서버가 이미 실행 중이므로 여기서 종료
          }
        }
      }
      // 응답은 없지만 포트는 사용 중
      console.warn(`포트 ${port}가 사용 중이지만, 백엔드 서버가 응답하지 않습니다. 테스트를 계속 진행합니다.`);
      console.log('이미 실행 중인 서버를 사용합니다.');
      return; // 서버가 이미 실행 중이므로 여기서 종료
    } catch (error) {
      if (error.message && error.message.includes('다른 프로세스')) {
        throw error;
      }
      // 연결 시도 중 다른 오류 발생, 서버 시작 계속 진행
    }
  }

  const backendPath = path.resolve(__dirname, '../backend');
  console.log(`백엔드 경로: ${backendPath}`);

  // npm run dev가 실제로 동작하는지 확인
  try {
    console.log('백엔드 package.json 확인...');
    const packageJson = require(path.join(backendPath, 'package.json'));
    console.log('백엔드 스크립트:', packageJson.scripts);
    
    if (!packageJson.scripts || !packageJson.scripts.dev) {
      console.error('백엔드 package.json에 "dev" 스크립트가 정의되어 있지 않습니다!');
      throw new Error('백엔드 설정 오류: "dev" 스크립트 없음');
    }
  } catch (error) {
    console.error('백엔드 package.json 확인 중 오류:', error.message);
  }

  // 운영체제에 맞는 명령어 생성
  const startCommand = createStartCommand(backendPath);
  console.log('실행 명령어:', startCommand.description);

  // 디버깅을 위한 진단 정보
  console.log('현재 작업 디렉토리:', process.cwd());
  console.log('Node.js 버전:', process.version);
  console.log('운영 체제:', process.platform);
  
  // 백엔드 디렉토리 확인
  try {
    const files = require('fs').readdirSync(backendPath);
    console.log('백엔드 디렉토리 파일 목록:', files.slice(0, 10), '...(총', files.length, '개)');
  } catch (error) {
    console.error('백엔드 디렉토리 읽기 실패:', error.message);
  }

  // 더 상세한 출력을 위해 stdio 설정 변경
  backendProcess = spawn(startCommand.command, startCommand.args, {
    cwd: backendPath,
    stdio: ['ignore', 'pipe', 'pipe'], // stdin은 무시, stdout과 stderr는 파이프
    shell: true
  });
  
  // 서버 로그 출력 (필터링 추가)
  backendProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    
    // 로그 필터링
    if (filterLog(output)) {
      console.log(`백엔드 로그: ${output}`);
    }
    
    // 서버 시작 성공 메시지 확인
    if (output.includes('서버가') && output.includes('포트에서 실행중입니다') ||
        output.includes('server') && output.includes('running') && output.includes('port')) {
      console.log('백엔드 서버가 시작되었음을 감지했습니다!');
    }
  });
  
  backendProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    
    // 로그 필터링
    if (filterLog(error)) {
      console.error(`백엔드 오류: ${error}`);
    }
    
    // 특정 오류 패턴 확인 및 안내
    if (error.includes('cross-env') && error.includes('not found')) {
      console.error('cross-env 명령어를 찾을 수 없습니다. npm install cross-env --save-dev 명령어로 설치해주세요.');
    }
    
    // 데이터베이스 연결 오류 확인
    if (error.includes('ECONNREFUSED')) {
      console.error('데이터베이스 연결에 실패했습니다. MySQL 서버가 실행 중인지 확인하세요.');
    }
    
    // 포트 충돌 확인
    if (error.includes('EADDRINUSE')) {
      console.error('포트가 이미 사용 중입니다. 다른 프로세스가 포트를 점유하고 있습니다.');
    }
  });
  
  // 프로세스 종료 이벤트 감지 - 이벤트 리스너 참조 저장
  closeListener = (code) => {
    if (code !== 0) {
      console.log(`백엔드 프로세스가 비정상 종료되었습니다. 종료 코드: ${code}`);
    } else {
      console.log(`백엔드 프로세스가 정상 종료되었습니다.`);
    }
  };
  
  errorListener = (error) => {
    console.error(`백엔드 프로세스 시작 오류: ${error.message}`);
  };
  
  backendProcess.on('close', closeListener);
  backendProcess.on('error', errorListener);
  
  console.log('서버 시작 프로세스 ID:', backendProcess.pid);
  
  // 서버가 제대로 시작될 때까지 대기
  const serverRunning = await waitForServer();
  
  if (!serverRunning) {
    console.error('서버 시작에 실패했지만, 테스트는 계속 진행합니다. 이 경우 테스트가 실패할 수 있습니다.');
  } else {
    console.log('백엔드 서버가 성공적으로 시작되었습니다.');
    // 백엔드 서버 진단 수행
    await diagnoseBackendServer();
  }
}, 60000); // 60초 타임아웃

// 테스트 종료 후 백엔드 서버 종료
afterAll(() => {
  if (backendProcess) {
    console.log('백엔드 서버를 종료합니다...');
    
    // 이벤트 리스너 제거
    if (closeListener) backendProcess.removeListener('close', closeListener);
    if (errorListener) backendProcess.removeListener('error', errorListener);
    
    // 운영체제에 따라 다른 종료 방법 사용
    try {
      if (process.platform === 'win32') {
        // Windows에서는 강제 종료
        spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t']);
      } else {
        // Linux/Mac에서는 SIGINT 신호 전송
        backendProcess.kill('SIGINT');
      }
    } catch (error) {
      console.error('서버 종료 중 오류:', error);
    }
    
    backendProcess = null;
  }
}, 10000);

beforeAll(() => {
  // Jest의 전역 설정 - 순환 참조 처리
  const originalStringify = JSON.stringify;
  JSON.stringify = function(obj, ...rest) {
    const seen = new WeakSet();
    const replacer = (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    };
    
    return originalStringify(obj, replacer, ...rest);
  };
});