// index.ts 수정
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import db from './models';
import { setupSocketIO } from './services/socketService';

// global에 io 속성 추가를 위한 타입 확장
declare global {
  var io: Server;
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('데이터베이스 연결 성공');

    // HTTP 서버 생성
    const server = http.createServer(app);
    
    // Socket.IO 인스턴스 생성
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    // 글로벌 io 객체 설정
    global.io = io;
    
    // 소켓 이벤트 리스너 설정
    setupSocketIO(io);

    server.listen(PORT, () => {
      console.log(`서버가 ${PORT}번 포트에서 실행중입니다.`);
      console.log('웹소켓 서버가 활성화되었습니다.');
    });
  } catch (error) {
    console.error('서버 시작 오류:', error);
    process.exit(1);
  }
};

startServer();