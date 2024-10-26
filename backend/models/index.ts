// backend/models/index.ts

import { Sequelize } from 'sequelize';
import sequelize from '../config/database';

// 모델 import
import User from './User';
import Challenge from './Challenge';
import Emotion from './Emotion';
import EmotionLog from './EmotionLog';
import MyDayComment from './MyDayComment';
import MyDayPost from './MyDayPost';
import SomeoneDayPost from './SomeoneDayPost';
import Tag from './Tag';
import MyDayLike from './MyDayLike';
import SomeoneDayComment from './SomeoneDayComment';
import SomeoneDayLike from './SomeoneDayLike';
import ChallengeParticipant from './ChallengeParticipant';
import ChallengeEmotion from './ChallengeEmotion';
import UserStats from './UserStats';
import Notification from './Notification';
import PostReport from './PostReport';
import EncouragementMessage from './EncouragementMessage';

const modelDefiners = [
  User,
  Challenge,
  Emotion,
  EmotionLog,
  MyDayComment,
  MyDayPost,
  SomeoneDayPost,
  Tag,
  MyDayLike,
  SomeoneDayComment,
  SomeoneDayLike,
  ChallengeParticipant,
  ChallengeEmotion,
  UserStats,
  Notification,
  PostReport,
  EncouragementMessage,
];

const db: any = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델 초기화
modelDefiners.forEach(model => {
  const modelInstance = model.initialize(sequelize);
  db[model.name] = modelInstance;
});

// 모델 간 관계 설정
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export type DbInterface = {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  User: typeof User;
  Challenge: typeof Challenge;
  Emotion: typeof Emotion;
  EmotionLog: typeof EmotionLog;
  MyDayComment: typeof MyDayComment;
  MyDayPost: typeof MyDayPost;
  SomeoneDayPost: typeof SomeoneDayPost;
  Tag: typeof Tag;
  MyDayLike: typeof MyDayLike;
  SomeoneDayComment: typeof SomeoneDayComment;
  SomeoneDayLike: typeof SomeoneDayLike;
  ChallengeParticipant: typeof ChallengeParticipant;
  ChallengeEmotion: typeof ChallengeEmotion;
  UserStats: typeof UserStats;
  Notification: typeof Notification;
  PostReport: typeof PostReport;
  EncouragementMessage: typeof EncouragementMessage;
};

export default db as DbInterface;
