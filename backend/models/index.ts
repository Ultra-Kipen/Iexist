import { Sequelize } from 'sequelize';
import { User } from './User';
import { Emotion } from './Emotion';
import { EmotionLog } from './EmotionLog';
import config from '../config';

const env = process.env.NODE_ENV || 'development';

let sequelize: Sequelize;

if (env === 'test') {
  // 테스트 환경: SQLite 사용
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  console.log('테스트 환경: SQLite 사용 중');
} else {
  // 개발 및 운영 환경: MySQL 사용
  const dbConfig = {
    database: config.database.name || 'iexist',
    username: config.database.user || 'Iexist',
    password: config.database.password || 'sw309824!@',
    host: config.database.host || 'localhost',
    port: config.database.port || 3306,
    dialect: 'mysql' as const
  };

  console.log('데이터베이스 연결 설정:', {
    ...dbConfig,
    password: '********' // 보안을 위해 비밀번호 마스킹
  });

  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      timezone: '+09:00',
      logging: env === 'development' ? console.log : false,
      dialectOptions: {
        dateStrings: true,
        typeCast: true,
        connectTimeout: 60000
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      retry: {
        max: 3, // 최대 재시도 횟수
        match: [/Deadlock/i, /ETIMEDOUT/] // 재시도할 에러 패턴
      }
    }
  );
  console.log(`${env} 환경: MySQL 사용 중`);
}

// 모델 초기화
User.initialize(sequelize);
Emotion.initialize(sequelize);
EmotionLog.initialize(sequelize);

// 모델 간 관계 설정
EmotionLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

EmotionLog.belongsTo(Emotion, {
  foreignKey: 'emotion_id',
  as: 'emotion'
});

User.hasMany(EmotionLog, {
  foreignKey: 'user_id',
  as: 'emotionLogs'
});

Emotion.hasMany(EmotionLog, {
  foreignKey: 'emotion_id',
  as: 'logs'
});

// 데이터베이스 연결 테스트 함수
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    if (error.original?.code === 'ECONNREFUSED') {
      console.error('MySQL 서버가 실행 중인지 확인하세요.');
      console.error('XAMPP Control Panel에서 MySQL이 실행 중인지 확인하세요.');
    }
    if (error.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('데이터베이스 사용자 이름 또는 비밀번호가 잘못되었습니다.');
    }
    if (error.original?.code === 'ER_BAD_DB_ERROR') {
      console.error('데이터베이스가 존재하지 않습니다.');
    }
    return false;
  }
};

const db = {
  sequelize,
  User,
  Emotion,
  EmotionLog,
  testConnection
};

export { sequelize, User, Emotion, EmotionLog };
export default db;