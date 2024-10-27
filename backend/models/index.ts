import { Sequelize } from 'sequelize';
import config from '../config/database';
import { User } from './User';
import { Challenge } from './Challenge';
import { Emotion } from './Emotion';
import { EmotionLog } from './EmotionLog';
import { MyDayComment } from './MyDayComment';
import { MyDayPost } from './MyDayPost';
import { SomeoneDayPost } from './SomeoneDayPost';
import { Tag } from './Tag';

const sequelize = config;

interface DB {
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
  [key: string]: any;
}

// Initialize models
const models: DB = {
  sequelize,
  Sequelize,
  User: User.initialize(sequelize),
  Challenge: Challenge.initialize(sequelize),
  Emotion: Emotion.initialize(sequelize),
  EmotionLog: EmotionLog.initialize(sequelize),
  MyDayComment: MyDayComment.initialize(sequelize),
  MyDayPost: MyDayPost.initialize(sequelize),
  SomeoneDayPost: SomeoneDayPost.initialize(sequelize),
  Tag: Tag.initialize(sequelize)
} as DB;

// Setup associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export default models;
export {
  sequelize,
  User,
  Challenge,
  Emotion,
  EmotionLog,
  MyDayComment,
  MyDayPost,
  SomeoneDayPost,
  Tag
};