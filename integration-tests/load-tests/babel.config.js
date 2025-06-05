// 필요한 경우, k6와 TypeScript를 함께 사용하기 위한 설정
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
};