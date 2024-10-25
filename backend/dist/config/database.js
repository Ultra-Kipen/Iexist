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
exports.testConnection = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("./config"));
exports.sequelize = new sequelize_1.Sequelize(config_1.default.database.name, config_1.default.database.username, config_1.default.database.password, {
    host: config_1.default.database.host,
    dialect: config_1.default.database.dialect,
    logging: false,
    timezone: '+09:00'
});
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.sequelize.authenticate();
        console.log('데이터베이스 연결 성공');
    }
    catch (error) {
        console.error('데이터베이스 연결 실패:', error);
        throw error;
    }
});
exports.testConnection = testConnection;
exports.default = { sequelize: exports.sequelize, testConnection: exports.testConnection };
