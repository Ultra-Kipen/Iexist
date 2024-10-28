import { Sequelize } from 'sequelize';
import config from '../config/database';

// 모델 imports
import User from './User';
import Challenge from './Challenge';
import ChallengeParticipant from './ChallengeParticipant';
import Emotion from './Emotion';
import EmotionLog from './EmotionLog';
import MyDayPost from './MyDayPost';
import MyDayComment from './MyDayComment';
import MyDayLike from './MyDayLike';
import SomeoneDayPost from './SomeoneDayPost';
import SomeoneDayComment from './SomeoneDayComment';
import Tag from './Tag';

const sequelize = config;

// 순차적 초기화를 위한 모델 그룹
const modelInitializationGroups = [
  // 1. 기본 테이블
  {
    User: User.initialize(sequelize),
    Emotion: Emotion.initialize(sequelize),
    Tag: Tag.initialize(sequelize)
  },
  
  // 2. 단일 외래키를 가진 테이블
  {
    Challenge: Challenge.initialize(sequelize),
    MyDayPost: MyDayPost.initialize(sequelize),
    SomeoneDayPost: SomeoneDayPost.initialize(sequelize)
  },
  
  // 3. 복합키 및 관계 테이블
  {
    ChallengeParticipant: ChallengeParticipant.initialize(sequelize),
    MyDayComment: MyDayComment.initialize(sequelize),
    SomeoneDayComment: SomeoneDayComment.initialize(sequelize),
    MyDayLike: MyDayLike.initialize(sequelize),
    EmotionLog: EmotionLog.initialize(sequelize)
  }
];

// 모델 초기화
const db: any = {
  sequelize,
  Sequelize
};

// 그룹별 순차 초기화
modelInitializationGroups.forEach((group) => {
  Object.assign(db, group);
});

// 모델 관계 설정
Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
export { sequelize };