// backend/config/database.ts

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 환경변수에서 직접 값을 읽어옴
const sequelize = new Sequelize(
    process.env.DB_NAME || 'iexist',
    process.env.DB_USER || 'Iexist',
    process.env.DB_PASSWORD || 'sw309824!@',
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        timezone: '+09:00',
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            underscored: true,
            freezeTableName: false,
            timestamps: true,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logQueryParameters: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
);

// 연결 테스트 함수
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('데이터베이스 연결 성공');
        return true;
    } catch (error) {
        console.error('데이터베이스 연결 실패:', error);
        return false;
    }
};

export default sequelize;
