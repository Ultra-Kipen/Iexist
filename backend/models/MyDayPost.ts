// models/MyDayPost.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

interface MyDayPostAttributes {
  post_id?: number; // optional로 변경
  user_id: number;
  content: string;
  emotion_summary: string | null;  // null 허용
  image_url: string | null;        // null 허용
  is_anonymous: boolean;
  character_count?: number;
  like_count: number;
  comment_count: number;
  created_at?: Date; 
  updated_at?: Date;
}

interface MyDayPostCreationAttributes extends Omit<MyDayPostAttributes, 'post_id'> {
  post_id?: number;
}

class MyDayPost extends Model<MyDayPostAttributes, MyDayPostCreationAttributes> {
  declare post_id: number;
  declare user_id: number;
  declare content: string;
  declare emotion_summary?: string;
  declare image_url?: string;
  declare is_anonymous: boolean;
  declare character_count?: number;
  declare like_count: number;
  declare comment_count: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  static initialize(sequelize: Sequelize): typeof MyDayPost {
    return MyDayPost.init(
      {
        post_id: {
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
          allowNull: false
        },
        emotion_summary: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: null
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: null
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        character_count: {
          type: DataTypes.SMALLINT.UNSIGNED,
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
        }
      },
      {
        sequelize,
        modelName: 'MyDayPost',
        tableName: 'my_day_posts',
        timestamps: true,
        underscored: true
      }
    );
  }
}

export default MyDayPost;