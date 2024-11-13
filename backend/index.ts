import app from './app';
import db from './models';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('데이터베이스 연결 성공');

    app.listen(PORT, () => {
      console.log(`서버가 ${PORT}번 포트에서 실행중입니다.`);
    });
  } catch (error) {
    console.error('서버 시작 오류:', error);
    process.exit(1);
  }
};

startServer();