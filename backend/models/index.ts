import { Sequelize } from 'sequelize';
import { User } from './User';
import { Emotion } from './Emotion';
import { EmotionLog } from './EmotionLog';
import BestPost from './BestPost';
import Challenge from './Challenge';
import ChallengeEmotion from './ChallengeEmotion';
import ChallengeParticipant from './ChallengeParticipant';
import EncouragementMessage from './EncouragementMessage';
import MyDayComment from './MyDayComment'; 
import MyDayEmotion from './MyDayEmotion';
import MyDayLike from './MyDayLike';
import MyDayPost from './MyDayPost';
import Notification from './Notification';
import PostRecommendation from './PostRecommendation';
import PostReport from './PostReport';
import PostTag from './PostTag';
import SomeoneDayComment from './SomeoneDayComment';
import SomeoneDayLike from './SomeoneDayLike';
import SomeoneDayPost from './SomeoneDayPost';
import SomeoneDayTag from './SomeoneDayTag';
import Tag from './Tag';
import UserGoal from './UserGoal';
import UserStats from './UserStats';
import UserBlock from './UserBlock';
import sequelize from '../config/database';

export class Database {
  public sequelize: Sequelize;
 public UserBlock!: typeof UserBlock; // 추가
 public User!: typeof User;
 public Emotion!: typeof Emotion;
 public EmotionLog!: typeof EmotionLog;
 public BestPost!: typeof BestPost;
 public Challenge!: typeof Challenge;
 public ChallengeEmotion!: typeof ChallengeEmotion;
 public ChallengeParticipant!: typeof ChallengeParticipant;
 public EncouragementMessage!: typeof EncouragementMessage;
 public MyDayComment!: typeof MyDayComment;
 public MyDayEmotion!: typeof MyDayEmotion;
 public MyDayLike!: typeof MyDayLike;
 public MyDayPost!: typeof MyDayPost;
 public Notification!: typeof Notification;
 public PostRecommendation!: typeof PostRecommendation;
 public PostReport!: typeof PostReport;
 public PostTag!: typeof PostTag;
 public SomeoneDayComment!: typeof SomeoneDayComment;
 public SomeoneDayLike!: typeof SomeoneDayLike;
 public SomeoneDayPost!: typeof SomeoneDayPost;
 public SomeoneDayTag!: typeof SomeoneDayTag;
 public Tag!: typeof Tag;
 public UserGoal!: typeof UserGoal; 
 
 public UserStats!: typeof UserStats;

 constructor(sequelizeInstance: Sequelize) {
   this.sequelize = sequelizeInstance;
   this.initializeModels();
   this.setupAssociations(); 
 }

 private initializeModels() {
  this.UserBlock = UserBlock.initialize(this.sequelize); // 추가
  this.User = User.initialize(this.sequelize);
  this.Emotion = Emotion.initialize(this.sequelize);
   this.EmotionLog = EmotionLog.initialize(this.sequelize);
   this.BestPost = BestPost.initialize(this.sequelize);
   this.Challenge = Challenge.initialize(this.sequelize);
   this.ChallengeEmotion = ChallengeEmotion.initialize(this.sequelize);
   this.ChallengeParticipant = ChallengeParticipant.initialize(this.sequelize);
   this.EncouragementMessage = EncouragementMessage.initialize(this.sequelize);
   this.MyDayComment = MyDayComment.initialize(this.sequelize);
   this.MyDayEmotion = MyDayEmotion.initialize(this.sequelize);
   this.MyDayLike = MyDayLike.initialize(this.sequelize);
   this.MyDayPost = MyDayPost.initialize(this.sequelize);
   this.Notification = Notification.initialize(this.sequelize);
   this.PostRecommendation = PostRecommendation.initialize(this.sequelize);
   this.PostReport = PostReport.initialize(this.sequelize);
   this.PostTag = PostTag.initialize(this.sequelize);
   this.SomeoneDayComment = SomeoneDayComment.initialize(this.sequelize);
   this.SomeoneDayLike = SomeoneDayLike.initialize(this.sequelize);
   this.SomeoneDayPost = SomeoneDayPost.initialize(this.sequelize);
   this.SomeoneDayTag = SomeoneDayTag.initialize(this.sequelize);
   this.Tag = Tag.initialize(this.sequelize);
   this.UserGoal = UserGoal.initialize(this.sequelize);
   this.UserStats = UserStats.initialize(this.sequelize);
 }
// Database 클래스에 close 메서드 추가
public async close(): Promise<void> {
  if (this.sequelize) {
    await this.sequelize.close();
  }
}
 private setupAssociations() {
  const models = {
    UserBlock: this.UserBlock,
    User: this.User,
    Emotion: this.Emotion,
     EmotionLog: this.EmotionLog,
     BestPost: this.BestPost,
     Challenge: this.Challenge,
     ChallengeEmotion: this.ChallengeEmotion,
     ChallengeParticipant: this.ChallengeParticipant,
     EncouragementMessage: this.EncouragementMessage, 
     MyDayComment: this.MyDayComment,
     MyDayEmotion: this.MyDayEmotion,
     MyDayLike: this.MyDayLike,
     MyDayPost: this.MyDayPost,
     Notification: this.Notification,
     PostRecommendation: this.PostRecommendation,
     PostReport: this.PostReport,
     PostTag: this.PostTag,
     SomeoneDayComment: this.SomeoneDayComment,
     SomeoneDayLike: this.SomeoneDayLike,
     SomeoneDayPost: this.SomeoneDayPost,
     SomeoneDayTag: this.SomeoneDayTag,
     Tag: this.Tag,
     UserGoal: this.UserGoal,
     UserStats: this.UserStats
   };

   Object.values(models).forEach((model: any) => {
    if (model.associate) {
      model.associate(models);
     }
   });
 }

 async testConnection(): Promise<boolean> {
   try {
     await this.sequelize.authenticate();
     console.log('데이터베이스 연결 성공');
     return true;
   } catch (error) {
     console.error('데이터베이스 연결 실패:', error);
     return false;
   }
 }

 async sync(options = {}): Promise<void> {
   await this.sequelize.sync(options);
 }
}

const db = new Database(sequelize);

export {
 User, Emotion, EmotionLog,
 BestPost, Challenge, ChallengeEmotion, ChallengeParticipant,
 EncouragementMessage, MyDayComment, MyDayEmotion, MyDayLike,
 MyDayPost, Notification, PostRecommendation, PostReport,
 PostTag, SomeoneDayComment, SomeoneDayLike, SomeoneDayPost,
 Tag, UserGoal, UserBlock,UserStats, SomeoneDayTag,
 sequelize
};

export default db;