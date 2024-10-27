import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import swaggerSpecs from './config/swagger';
import logger from './utils/logger';
import routes from './routes';
import errorMiddleware from './middleware/errorMiddleware';
import loggingMiddleware from './middleware/loggingMiddleware';
import rateLimitMiddleware from './middleware/rateLimitMiddleware';
import { sequelize } from './config/database';
import config from './config/config';

const app = express();

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 보안 미들웨어
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:"],
      "script-src": ["'self'", "'unsafe-inline'", "https:"],
      "style-src": ["'self'", "'unsafe-inline'", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

// CORS 설정
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // CORS 프리플라이트 요청 캐시
}));

// 로깅 미들웨어
if (config.server.nodeEnv !== 'test') {
  app.use(loggingMiddleware);
}

// Rate Limiting
if (config.server.nodeEnv === 'production') {
  app.use(config.api.prefix, rateLimitMiddleware);
}

// API 문서
if (config.server.nodeEnv !== 'production') {
  app.use('/api-docs', swaggerUi.serve);
  app.use('/api-docs', swaggerUi.setup(swaggerSpecs, {
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
app.use(config.api.prefix, routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Iexist API is running',
    version: config.api.version,
    environment: config.server.nodeEnv,
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
app.use(errorMiddleware);

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 및 모델 동기화
    await sequelize.authenticate();
    logger.info('데이터베이스 연결 성공');

    await sequelize.sync({ force: false, alter: config.server.nodeEnv === 'development' });
    logger.info('데이터베이스 동기화 완료');

    // 서버 시작
    const server = app.listen(config.server.port, () => {
      logger.info(`서버가 포트 ${config.server.port}번에서 실행 중입니다.`);
      if (config.server.nodeEnv !== 'production') {
        logger.info(`API 문서: http://localhost:${config.server.port}/api-docs`);
      }
      logger.info(`환경: ${config.server.nodeEnv}`);
    });

    // 종료 처리
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} 시그널 수신, 서버 종료 시작...`);
      
      server.close(async () => {
        logger.info('활성 연결 종료 완료');
        
        try {
          await sequelize.close();
          logger.info('데이터베이스 연결 종료');
          process.exit(0);
        } catch (error) {
          logger.error('데이터베이스 연결 종료 중 오류:', error);
          process.exit(1);
        }
      });

      // 강제 종료 타임아웃
      setTimeout(() => {
        logger.error('정상 종료 실패, 강제 종료');
        process.exit(1);
      }, 10000);
    };

    // 시그널 처리
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

// 예외 처리
process.on('unhandledRejection', (reason, promise) => {
  logger.error('처리되지 않은 Promise 거부:', reason);
  // 개발 환경에서만 스택 트레이스 출력
  if (config.server.nodeEnv === 'development') {
    console.error('Promise:', promise);
  }
});

process.on('uncaughtException', (error) => {
  logger.error('처리되지 않은 예외:', error);
  // 정상적인 종료 시도
  process.exit(1);
});

// 메모리 사용량 모니터링 (개발 환경)
if (config.server.nodeEnv === 'development') {
  setInterval(() => {
    const used = process.memoryUsage();
    logger.debug('메모리 사용량:', {
      rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(used.external / 1024 / 1024)}MB`
    });
  }, 300000); // 5분마다
}

// 서버 시작
startServer();

export default app;