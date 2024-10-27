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
  Tag
};

Object.values(db).forEach((model: any) => {
  if (typeof model.initialize === 'function') {
    model.initialize(sequelize);
  }
});

Object.values(db).forEach((model: any) => {
  if (typeof model.associate === 'function') {
    model.associate(db);
  }
});

export default db;