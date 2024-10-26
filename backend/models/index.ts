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

const db: any = {};

const initModels = (sequelize: Sequelize) => {
  // 각 모델 초기화
  User.init(User.getAttributes(), { sequelize });
  Challenge.init(Challenge.getAttributes(), { sequelize });
  Emotion.init(Emotion.getAttributes(), { sequelize });
  EmotionLog.init(EmotionLog.getAttributes(), { sequelize });
  MyDayComment.init(MyDayComment.getAttributes(), { sequelize });
  MyDayPost.init(MyDayPost.getAttributes(), { sequelize });
  SomeoneDayPost.init(SomeoneDayPost.getAttributes(), { sequelize });
  Tag.init(Tag.getAttributes(), { sequelize });
  MyDayLike.init(MyDayLike.getAttributes(), { sequelize });
  SomeoneDayComment.init(SomeoneDayComment.getAttributes(), { sequelize });
  SomeoneDayLike.init(SomeoneDayLike.getAttributes(), { sequelize });
  ChallengeParticipant.init(ChallengeParticipant.getAttributes(), { sequelize });
  ChallengeEmotion.init(ChallengeEmotion.getAttributes(), { sequelize });
  UserStats.init(UserStats.getAttributes(), { sequelize });
  Notification.init(Notification.getAttributes(), { sequelize });
  PostReport.init(PostReport.getAttributes(), { sequelize });
  EncouragementMessage.init(EncouragementMessage.getAttributes(), { sequelize });

  // 모델 객체들을 db 객체에 추가
  db.User = User;
  db.Challenge = Challenge;
  db.Emotion = Emotion;
  db.EmotionLog = EmotionLog;
  db.MyDayComment = MyDayComment;
  db.MyDayPost = MyDayPost;
  db.SomeoneDayPost = SomeoneDayPost;
  db.Tag = Tag;
  db.MyDayLike = MyDayLike;
  db.SomeoneDayComment = SomeoneDayComment;
  db.SomeoneDayLike = SomeoneDayLike;
  db.ChallengeParticipant = ChallengeParticipant;
  db.ChallengeEmotion = ChallengeEmotion;
  db.UserStats = UserStats;
  db.Notification = Notification;
  db.PostReport = PostReport;
  db.EncouragementMessage = EncouragementMessage;

  // 관계 설정
  Object.values(db).forEach((model: any) => {
    if (model.associate) {
      model.associate(db);
    }
  });
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델 초기화 실행
initModels(sequelize);

export default db;
