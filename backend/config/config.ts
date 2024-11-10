const config = {
  server: {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'Iexist', 
    password: process.env.DB_PASSWORD || 'sw309824!@',
    name: process.env.DB_NAME || 'iexist',
    dialect: 'mysql' as const
  },
  api: {
    prefix: process.env.API_PREFIX || '/api',
    version: process.env.API_VERSION || '1.0.0'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true', 
    title: process.env.SWAGGER_TITLE || 'Iexist API',
    description: process.env.SWAGGER_DESCRIPTION || 'Iexist API Documentation',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    url: process.env.SWAGGER_URL || 'http://localhost:3000/api-docs'
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },
  pagination: {
    defaultPageSize: Number(process.env.DEFAULT_PAGE_SIZE) || 10,
    maxPageSize: Number(process.env.MAX_PAGE_SIZE) || 100
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15분
    max: Number(process.env.RATE_LIMIT_MAX) || 100
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'dev'
  }
} as const;

export default config;