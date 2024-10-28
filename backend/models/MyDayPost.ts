import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayPost extends Model {
  public post_id!: number;  // id 대신 post_id 사용
  public user_id!: number;
  public content!: string;
  public emotion_summary?: string;
  public image_url?: string;
  public is_anonymous!: boolean;
  public character_count?: number;
  public like_count!: number;
  public comment_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    return MyDayPost.init(
      {
        post_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          field: 'post_id'  // 실제 DB 컬럼명 명시
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
  }

  public static associate(models: any) {
    const { User, MyDayComment, MyDayLike, Emotion } = models;

    MyDayPost.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE'
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