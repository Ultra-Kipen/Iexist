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

// 모델 초기화 순서 정의
const initOrder = [
  'User',
  'MyDayPost',
  'MyDayComment',
  'MyDayLike',
  'SomeoneDayPost',
  'SomeoneDayComment',
  'SomeoneDayLike',
  'Challenge',
  'ChallengeParticipant',
  'ChallengeEmotion',
  'Emotion',
  'EmotionLog',
  'Tag',
  'UserStats',
  'Notification',
  'PostReport',
  'EncouragementMessage'
];

// 모델 매핑
const modelMapping = {
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
  EncouragementMessage
};

const models: any = {};

// 순서대로 모델 초기화
initOrder.forEach((modelName) => {
  const model = modelMapping[modelName];
  if (model?.initModel) {
    models[modelName] = model.initModel(sequelize);
  }
});

// DB 객체 생성
const db = {
  sequelize,
  Sequelize,
  ...models
};

// 초기화된 모델들의 관계 설정
Object.values(models).forEach((model: any) => {
  if (model?.associate) {
    model.associate(models);
  }
});

export default db;

// TypeScript 타입 정의
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