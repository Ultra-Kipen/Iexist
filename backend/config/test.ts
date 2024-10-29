export default {
    jwt: {
      secret: '=UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=',
      expiresIn: '1h'
    },
    database: {
      dialect: 'sqlite',
      storage: ':memory:'
    },
    bcrypt: {
      saltRounds: 1 // 테스트에서는 빠른 처리를 위해 낮은 값 사용
    }
  };