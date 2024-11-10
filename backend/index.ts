import app from './app';
import db from './models';

const PORT = process.env.PORT || 3000;

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행중입니다.`);
  });
}).catch((err: Error) => {
  console.error('데이터베이스 연결 오류:', err);
});