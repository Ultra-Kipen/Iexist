"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// .env 파일 경로 설정
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', '..', '.env') });
const env = process.env.NODE_ENV || 'development';
let sequelize;
const defaultOptions = {
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    },
    logging: console.log
};
// 기본 development 환경 설정
sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'Iexist', process.env.DB_USER || 'Iexist', process.env.DB_PASSWORD, Object.assign(Object.assign({}, defaultOptions), { host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '3306') }));
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        return true;
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
});
exports.testConnection = testConnection;
exports.default = sequelize;
