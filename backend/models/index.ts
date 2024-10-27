// backend/models/index.ts

import { Sequelize } from 'sequelize';
import sequelize from '../config/database';

// 모델 import
import User from './User';
import Tag from './Tag';
import Emotion from './Emotion';
import Challenge from './Challenge';
import MyDayPost from './MyDayPost';
import SomeoneDayPost from './SomeoneDayPost';
import MyDayComment from './MyDayComment';
import MyDayLike from './MyDayLike';
import SomeoneDayComment from './SomeoneDayComment';
import SomeoneDayLike from './SomeoneDayLike';
import EmotionLog from './EmotionLog';
import ChallengeParticipant from './ChallengeParticipant';
import ChallengeEmotion from './ChallengeEmotion';
import UserStats from './UserStats';
import Notification from './Notification';
import PostReport from './PostReport';
import EncouragementMessage from './EncouragementMessage';

// DbType 인터페이스 정의
interface DbType {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  User?: typeof User;
  Tag?: typeof Tag;
  Emotion?: typeof Emotion;
  Challenge?: typeof Challenge;
  MyDayPost?: typeof MyDayPost;
  SomeoneDayPost?: typeof SomeoneDayPost;
  MyDayComment?: typeof MyDayComment;
  MyDayLike?: typeof MyDayLike;
  SomeoneDayComment?: typeof SomeoneDayComment;
  SomeoneDayLike?: typeof SomeoneDayLike;
  EmotionLog?: typeof EmotionLog;
  ChallengeParticipant?: typeof ChallengeParticipant;
  ChallengeEmotion?: typeof ChallengeEmotion;
  UserStats?: typeof UserStats;
  Notification?: typeof Notification;
  PostReport?: typeof PostReport;
  EncouragementMessage?: typeof EncouragementMessage;
  [key: string]: any;
}

const db: DbType = {
  sequelize,
  Sequelize,
};

// 모델 초기화
const models = [
  User,
  Tag,
  Emotion,
  Challenge,
  MyDayPost,
  SomeoneDayPost,
  MyDayComment,
  MyDayLike,
  SomeoneDayComment,
  SomeoneDayLike,
  EmotionLog,
  ChallengeParticipant,
  ChallengeEmotion,
  UserStats,
  Notification,
  PostReport,
  EncouragementMessage,
];

models.forEach((model) => {
  if (typeof model.initialize === 'function') {
    model.initialize(sequelize);
    db[model.name] = model;
  } else {
    console.warn(`${model.name} 모델에 initialize 메서드가 없습니다.`);
  }
});

// 모델 간 관계 설정
Object.values(db).forEach((model: any) => {
  if (model && typeof model.associate === 'function') {
    model.associate(db);
  }
});

// 기존 테이블을 유지하며 동기화
sequelize.sync()
  .then(() => {
    console.log("Database synchronized without altering existing columns.");
  })
  .catch((error) => {
    console.error("Error synchronizing database:", error);
  });

export type { DbType };
export default db;
