// generate-test-token.js
const jwt = require('jsonwebtoken');
const fs = require('fs');

// 테스트용 사용자 ID
const userId = 1; // 데이터베이스에 존재하는 실제 사용자 ID로 변경

// .env.test 파일에서 JWT_SECRET 읽기
const envFile = fs.readFileSync('.env.test', 'utf8');
const jwtSecretMatch = envFile.match(/JWT_SECRET=(.+)/);

if (!jwtSecretMatch) {
  console.error('JWT_SECRET을 찾을 수 없습니다.');
  process.exit(1);
}

const JWT_SECRET = jwtSecretMatch[1].trim();
console.log(`JWT 시크릿 키: ${JWT_SECRET}`);

// 토큰 생성
const token = jwt.sign(
  { user_id: userId },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('\n테스트용 JWT 토큰:');
console.log(token);
console.log('\n토큰 사용 방법:');
console.log(`k6 run -e AUTH_TOKEN=${token} tests/performance/api-load-test.js`);