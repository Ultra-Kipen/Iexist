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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const swagger_1 = __importDefault(require("./config/swagger"));
const logger_1 = __importDefault(require("./utils/logger"));
const routes_1 = __importDefault(require("./routes"));
const errorMiddleware_1 = __importDefault(require("./middleware/errorMiddleware"));
const loggingMiddleware_1 = __importDefault(require("./middleware/loggingMiddleware"));
const rateLimitMiddleware_1 = __importDefault(require("./middleware/rateLimitMiddleware"));
const database_1 = require("./config/database");
const config_1 = __importDefault(require("./config/config"));
const app = (0, express_1.default)();
// 기본 미들웨어
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 보안 미들웨어
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: Object.assign(Object.assign({}, helmet_1.default.contentSecurityPolicy.getDefaultDirectives()), { "img-src": ["'self'", "data:", "https:"], "script-src": ["'self'", "'unsafe-inline'", "https:"], "style-src": ["'self'", "'unsafe-inline'", "https:"] })
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));
// CORS 설정
app.use((0, cors_1.default)({
    origin: config_1.default.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // CORS 프리플라이트 요청 캐시
}));
// 로깅 미들웨어
if (config_1.default.server.nodeEnv !== 'test') {
    app.use(loggingMiddleware_1.default);
}
// Rate Limiting
if (config_1.default.server.nodeEnv === 'production') {
    app.use(config_1.default.api.prefix, rateLimitMiddleware_1.default);
}
// API 문서
if (config_1.default.server.nodeEnv !== 'production') {
    app.use('/api-docs', swagger_ui_express_1.default.serve);
    app.use('/api-docs', swagger_ui_express_1.default.setup(swagger_1.default, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Iexist API Documentation",
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true
        }
    }));
}
// API 라우트
app.use(config_1.default.api.prefix, routes_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'success',
        message: 'Iexist API is running',
        version: config_1.default.api.version,
        environment: config_1.default.server.nodeEnv,
        timestamp: new Date().toISOString()
    });
});
// 404 처리
app.use((_req, res) => {
    res.status(404).json({
        status: 'error',
        message: '요청하신 리소스를 찾을 수 없습니다.'
    });
});
// 에러 처리
app.use(errorMiddleware_1.default);
// 서버 시작
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 데이터베이스 연결 및 모델 동기화
        yield database_1.sequelize.authenticate();
        logger_1.default.info('데이터베이스 연결 성공');
        yield database_1.sequelize.sync({ force: false, alter: config_1.default.server.nodeEnv === 'development' });
        logger_1.default.info('데이터베이스 동기화 완료');
        // 서버 시작
        const server = app.listen(config_1.default.server.port, () => {
            logger_1.default.info(`서버가 포트 ${config_1.default.server.port}번에서 실행 중입니다.`);
            if (config_1.default.server.nodeEnv !== 'production') {
                logger_1.default.info(`API 문서: http://localhost:${config_1.default.server.port}/api-docs`);
            }
            logger_1.default.info(`환경: ${config_1.default.server.nodeEnv}`);
        });
        // 종료 처리
        const gracefulShutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.info(`${signal} 시그널 수신, 서버 종료 시작...`);
            server.close(() => __awaiter(void 0, void 0, void 0, function* () {
                logger_1.default.info('활성 연결 종료 완료');
                try {
                    yield database_1.sequelize.close();
                    logger_1.default.info('데이터베이스 연결 종료');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.default.error('데이터베이스 연결 종료 중 오류:', error);
                    process.exit(1);
                }
            }));
            // 강제 종료 타임아웃
            setTimeout(() => {
                logger_1.default.error('정상 종료 실패, 강제 종료');
                process.exit(1);
            }, 10000);
        });
        // 시그널 처리
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger_1.default.error('서버 시작 실패:', error);
        process.exit(1);
    }
});
// 예외 처리
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('처리되지 않은 Promise 거부:', reason);
    // 개발 환경에서만 스택 트레이스 출력
    if (config_1.default.server.nodeEnv === 'development') {
        console.error('Promise:', promise);
    }
});
process.on('uncaughtException', (error) => {
    logger_1.default.error('처리되지 않은 예외:', error);
    // 정상적인 종료 시도
    process.exit(1);
});
// 메모리 사용량 모니터링 (개발 환경)
if (config_1.default.server.nodeEnv === 'development') {
    setInterval(() => {
        const used = process.memoryUsage();
        logger_1.default.debug('메모리 사용량:', {
            rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(used.external / 1024 / 1024)}MB`
        });
    }, 300000); // 5분마다
}
// 서버 시작
startServer();
exports.default = app;
