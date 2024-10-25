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
const database_1 = __importDefault(require("../config/database"));
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 데이터베이스 연결 테스트
        yield database_1.default.authenticate();
        console.log('Database connection established successfully.');
        // 여기서는 테이블을 새로 생성하지 않고 연결만 테스트합니다
        // 이미 데이터베이스와 테이블이 존재하기 때문입니다
        console.log('Database connection test completed.');
        // 선택적: 데이터베이스의 테이블 목록 조회
        const [results] = yield database_1.default.query('SHOW TABLES');
        console.log('Existing tables:', results);
    }
    catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
});
// 스크립트를 직접 실행할 때만 실행
if (require.main === module) {
    initDatabase()
        .then(() => {
        console.log('Database connection test completed.');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Database connection test failed:', error);
        process.exit(1);
    });
}
exports.default = initDatabase;
