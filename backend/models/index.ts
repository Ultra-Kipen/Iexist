import { Model, Sequelize } from 'sequelize';
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
import Tag from './Tag';
import UserGoal from './UserGoal';
import UserStats from './UserStats';
import sequelize from '../config/database';

export class Database {
  public sequelize: Sequelize;
  
  // 모델 선언
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
  public Tag!: typeof Tag;
  public UserGoal!: typeof UserGoal;
  public UserStats!: typeof UserStats;

  constructor(sequelizeInstance: Sequelize) {
    this.sequelize = sequelizeInstance;
    this.initializeModels();
    this.setupAssociations();
  }

  private initializeModels() {
   // 기본 모델 초기화
   User.initialize(this.sequelize);
   Emotion.initialize(this.sequelize);
   EmotionLog.initialize(this.sequelize);
   
   // Best/Post 관련 모델 초기화
   BestPost.initialize(this.sequelize);
   PostRecommendation.initialize(this.sequelize);
   PostReport.initialize(this.sequelize);
   PostTag.initialize(this.sequelize);
   
   // Challenge 관련 모델 초기화
   Challenge.initialize(this.sequelize);
   ChallengeParticipant.initialize(this.sequelize);
   ChallengeEmotion.initialize(this.sequelize);
   
   // MyDay 관련 모델 초기화
   MyDayPost.initialize(this.sequelize);
   MyDayComment.initialize(this.sequelize);
   MyDayLike.initialize(this.sequelize);
   MyDayEmotion.initialize(this.sequelize);
   
   // SomeoneDay 관련 모델 초기화
   SomeoneDayPost.initialize(this.sequelize);
   SomeoneDayComment.initialize(this.sequelize);
   SomeoneDayLike.initModel(this.sequelize);
   
   // 기타 모델 초기화
   // 기타 모델 초기화
EncouragementMessage.initModel(this.sequelize);
Notification.initModel(this.sequelize);
Tag.initialize(this.sequelize);
UserGoal.initialize(this.sequelize);
UserStats.initModel(this.sequelize);  // init -> initModel로 변경

    // 모델 인스턴스 할당
    this.User = User;
    this.Emotion = Emotion;
    this.EmotionLog = EmotionLog;
    this.BestPost = BestPost;
    this.Challenge = Challenge;
    this.ChallengeEmotion = ChallengeEmotion;
    this.ChallengeParticipant = ChallengeParticipant;
    this.EncouragementMessage = EncouragementMessage;
    this.MyDayComment = MyDayComment;
    this.MyDayEmotion = MyDayEmotion;
    this.MyDayLike = MyDayLike;
    this.MyDayPost = MyDayPost;
    this.Notification = Notification;
    this.PostRecommendation = PostRecommendation;
    this.PostReport = PostReport;
    this.PostTag = PostTag;
    this.SomeoneDayComment = SomeoneDayComment;
    this.SomeoneDayLike = SomeoneDayLike;
    this.SomeoneDayPost = SomeoneDayPost;
    this.Tag = Tag;
    this.UserGoal = UserGoal;
    this.UserStats = UserStats;
  }

  private setupAssociations() {
    const models = {
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
      Tag: this.Tag,
      UserGoal: this.UserGoal,
      UserStats: this.UserStats
    };

    // 각 모델의 associate 메서드 호출
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
  Tag, UserGoal, UserStats,
  sequelize
};

export default db;