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

const db = {
  sequelize,
  Sequelize,
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

// 모든 모델 초기화
Object.values(db).forEach((model: any) => {
  if (typeof model?.init === 'function') {
    model.init(sequelize);
  }
});

// 모델 간 관계 설정
Object.values(db).forEach((model: any) => {
  if (typeof model?.associate === 'function') {
    model.associate(db);
  }
});

export default db;
