import express from 'express';
import cors from 'cors';
import routes from './routes';
import errorMiddleware from './middleware/errorMiddleware';
import corsMiddleware from './middleware/corsMiddleware';

const app = express();

app.use(express.json());
app.use(cors());
app.use(corsMiddleware);

// API 라우트 설정
app.use('/api', routes);

// 에러 핸들링
app.use(errorMiddleware);

export default app;