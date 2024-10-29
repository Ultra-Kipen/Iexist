import { Options } from 'sequelize';

interface DatabaseConfig {
  development: Options;
  test: Options;
  production: Options;
}

const config: DatabaseConfig = {
  development: {
    username: process.env.DB_USER || 'Iexist',
    password: process.env.DB_PASSWORD || 'sw309824!@',
    database: process.env.DB_NAME || 'iexist',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    timezone: '+09:00',
    dialectOptions: {
      connectTimeout: 60000,
      socketPath: process.platform === 'win32' ? undefined : '/var/run/mysqld/mysqld.sock'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: console.log
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    timezone: '+09:00',
    dialectOptions: {
      connectTimeout: 60000,
      socketPath: process.platform === 'win32' ? undefined : '/var/run/mysqld/mysqld.sock'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
};

export default config;