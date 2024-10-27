"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const port = Number(process.env.PORT) || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
const config = {
    server: {
        port,
        nodeEnv
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        username: process.env.DB_USER || 'Iexist',
        password: process.env.DB_PASSWORD || 'sw309824!@',
        name: process.env.DB_NAME || 'iexist',
        dialect: 'mysql'
    },
    api: {
        prefix: '/api',
        version: process.env.API_VERSION || '1.0.0'
    },
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        allowedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000']
    },
    swagger: {
        enabled: true,
        title: 'Iexist API',
        description: 'Iexist API Documentation',
        version: process.env.API_VERSION || '1.0.0',
        url: process.env.SWAGGER_URL || 'http://localhost:3000/api-docs'
    },
    security: {
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        jwtExpiration: process.env.JWT_EXPIRATION || '24h'
    }
};
exports.default = config;
