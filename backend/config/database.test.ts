export default {
    test: {
      username: process.env.TEST_DB_USER || 'root',
      password: process.env.TEST_DB_PASSWORD || '',
      database: process.env.TEST_DB_NAME || 'iexist_test',
      host: process.env.TEST_DB_HOST || '127.0.0.1',
      dialect: 'mysql',
      logging: false
    }
  };