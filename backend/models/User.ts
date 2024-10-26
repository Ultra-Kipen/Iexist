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
  Sequelize
};

// 모델 초기화
User.init(User.getAttributes(), { sequelize });
Challenge.init(Challenge.getAttributes(), { sequelize });
Emotion.init(Emotion.getAttributes(), { sequelize });
EmotionLog.init(EmotionLog.getAttributes(), { sequelize });
MyDayComment.init(MyDayComment.getAttributes(), { sequelize });
MyDayPost.init(MyDayPost.getAttributes(), { sequelize });
SomeoneDayPost.init(SomeoneDayPost.getAttributes(), { sequelize });
Tag.init(Tag.getAttributes(), { sequelize });

// db 객체에 모델 추가
db.User = User;
db.Challenge = Challenge;
db.Emotion = Emotion;
db.EmotionLog = EmotionLog;
db.MyDayComment = MyDayComment;
db.MyDayPost = MyDayPost;
db.SomeoneDayPost = SomeoneDayPost;
db.Tag = Tag;

// 모델 간 관계 설정
Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
