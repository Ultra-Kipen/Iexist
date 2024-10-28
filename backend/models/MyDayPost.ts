import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayPost extends Model {
  public id!: number;
  public user_id!: number;
  public content!: string;
  public image_url?: string;
  public emotion_summary?: string;
  public is_anonymous!: boolean;

  public static initialize(sequelize: Sequelize) {
    const model = MyDayPost.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            len: [1, 1000]
          }
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        emotion_summary: {
          type: DataTypes.STRING(100),
          allowNull: true
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
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

  public static associate(models: any) {
    const { User, MyDayComment, MyDayLike, Emotion } = models;

    if (User && MyDayComment && MyDayLike && Emotion) {
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
}

export default MyDayPost;