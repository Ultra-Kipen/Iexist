import { Sequelize } from 'sequelize';
import config from '../config/database';

// 모델 imports
import User from './User';
import Challenge from './Challenge';
import ChallengeParticipant from './ChallengeParticipant';
import Emotion from './Emotion';
import EmotionLog from './EmotionLog';
import MyDayComment from './MyDayComment';
import MyDayPost from './MyDayPost';
import MyDayEmotion from './MyDayEmotion';
import SomeoneDayPost from './SomeoneDayPost';
import SomeoneDayComment from './SomeoneDayComment';
import PostReport from './PostReport';
import Tag from './Tag';
import PostTag from './PostTag';
import UserGoal from './UserGoal';

// config/database.ts에서 가져온 sequelize 인스턴스 사용
const sequelize = config;

// 모델들을 담을 interface 정의
interface DB {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  User: typeof User;
  Challenge: typeof Challenge;
  ChallengeParticipant: typeof ChallengeParticipant;
  Emotion: typeof Emotion;
  EmotionLog: typeof EmotionLog;
  MyDayComment: typeof MyDayComment;
  MyDayPost: typeof MyDayPost;
  MyDayEmotion: typeof MyDayEmotion;
  SomeoneDayPost: typeof SomeoneDayPost;
  SomeoneDayComment: typeof SomeoneDayComment;
  PostReport: typeof PostReport;
  Tag: typeof Tag;
  PostTag: typeof PostTag;
  UserGoal: typeof UserGoal;
  [key: string]: any;
}

// 데이터베이스 객체 초기화
const db: DB = {
  sequelize,
  Sequelize,
  User: User.initialize(sequelize),
  Challenge: Challenge.initialize(sequelize),
  ChallengeParticipant: ChallengeParticipant.initialize(sequelize),
  Emotion: Emotion.initialize(sequelize),
  EmotionLog: EmotionLog.initialize(sequelize),
  MyDayComment: MyDayComment.initialize(sequelize),
  MyDayPost: MyDayPost.initialize(sequelize),
  MyDayEmotion: MyDayEmotion.initialize(sequelize),
  SomeoneDayPost: SomeoneDayPost.initialize(sequelize),
  SomeoneDayComment: SomeoneDayComment.initialize(sequelize),
  PostReport: PostReport.initialize(sequelize),
  Tag: Tag.initialize(sequelize),
  PostTag: PostTag.initialize(sequelize),
  UserGoal: UserGoal.initialize(sequelize)
};

// 모델 간 관계 설정
Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
export { sequelize };