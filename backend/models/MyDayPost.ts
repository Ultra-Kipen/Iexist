import { Model, DataTypes, Sequelize } from 'sequelize';
interface MyDayPostAttributes {
  post_id: number;
  user_id: number;
  content: string;
  emotion_summary?: string;
  image_url?: string;
  is_anonymous: boolean;
  character_count?: number;
  like_count: number;
  comment_count: number;
  created_at: Date;
  updated_at: Date;
 }
 
 class MyDayPost extends Model<MyDayPostAttributes, Omit<MyDayPostAttributes, 'post_id'>> {
  public post_id!: number; 
  public user_id!: number;
  public content!: string;
  public emotion_summary?: string;
  public image_url?: string;
  public is_anonymous!: boolean;
  public character_count?: number;
  public like_count!: number;
  public comment_count!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public static initialize(sequelize: Sequelize): typeof MyDayPost {
    MyDayPost.init(
      {
        post_id: {  // id -> post_id 변경
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: true
          }
        },
        emotion_summary: {
          type: DataTypes.STRING(100),
          allowNull: true
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        character_count: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        like_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        comment_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'MyDayPost',
        tableName: 'my_day_posts',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['user_id']
          },
          {
            fields: ['created_at']
          }
        ]
      }
    );
    return MyDayPost;
  }
// MyDayPost.ts의 associate 함수 수정
// MyDayPost.ts - associate 함수 수정
public static associate(models: any): void {
  MyDayPost.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
 
  MyDayPost.hasMany(models.MyDayComment, {
    foreignKey: 'post_id',
    as: 'my_day_comments'
  });
 
  MyDayPost.hasMany(models.MyDayLike, {
    foreignKey: 'post_id',
    as: 'my_day_likes'
  });
 
  MyDayPost.belongsToMany(models.Emotion, {
    through: 'my_day_emotions',
    foreignKey: 'post_id',
    otherKey: 'emotion_id',
    as: 'emotions'
  });
 }
 }
export default MyDayPost;