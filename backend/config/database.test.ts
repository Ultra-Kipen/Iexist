import { Sequelize, Options } from 'sequelize';

const testConfig: Options = {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'), 
  username: process.env.DB_USER || 'Iexist',
  password: process.env.DB_PASSWORD || 'sw309824!@',
  database: process.env.DB_NAME || 'iexist_test',
  logging: false, // 테스트 중 로깅 비활성화
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  }
};

const sequelize = new Sequelize(testConfig);

export default sequelize;