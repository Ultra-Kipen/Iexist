import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;