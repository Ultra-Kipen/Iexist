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
}
class MyDayPost extends Model<MyDayPostAttributes> {
  public post_id!: number;  // id -> post_id 변경
  public user_id!: number;
  public content!: string;
  public emotion_summary?: string;
  public image_url?: string;
  public is_anonymous!: boolean;
  public character_count?: number;
  public like_count!: number;
  public comment_count!: number;
  public static initialize(sequelize: Sequelize) {
    const model = MyDayPost.init(
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
    return model;
  }

  public static associate(models: any): void {
    const { User, MyDayComment, MyDayLike, Emotion } = models;

    MyDayPost.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    MyDayPost.hasMany(MyDayComment, {
      foreignKey: 'post_id',
      as: 'comments',
      onDelete: 'CASCADE'
    });

    MyDayPost.hasMany(MyDayLike, {
      foreignKey: 'post_id',
      as: 'likes',
      onDelete: 'CASCADE'
    });

    MyDayPost.belongsToMany(Emotion, {
      through: 'my_day_emotions',
      foreignKey: 'post_id',
      otherKey: 'emotion_id',
      as: 'emotions'
    });
  }
}

export default MyDayPost;