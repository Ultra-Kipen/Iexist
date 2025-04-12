// generate-token.js
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { user_id: 1 },  // 테스트 사용자 ID
  'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=',  // JWT_SECRET
  { expiresIn: '1h' }
);

console.log(`생성된 토큰: ${token}`);