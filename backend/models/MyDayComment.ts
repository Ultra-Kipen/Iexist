import { Model, DataTypes, Sequelize } from 'sequelize';
import { User } from '../models/User';
import MyDayPost from '../models/MyDayPost';

interface MyDayCommentAttributes {
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  is_anonymous: boolean;
  created_at?: Date;
}

class MyDayComment extends Model<MyDayCommentAttributes> {
  public static initialize(sequelize: Sequelize) {
    const model = MyDayComment.init(
      {
        comment_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'my_day_posts',
            key: 'post_id'
          }
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
          type: DataTypes.STRING(500),
          allowNull: false
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'MyDayComment',
        tableName: 'my_day_comments',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['post_id']
          },
          {
            fields: ['user_id']
          }
        ]
      }
    );
    return model;
  }

  public static associate(models: any): void {
    const { User, MyDayPost } = models;

    MyDayComment.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    MyDayComment.belongsTo(MyDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });
  }
}

export default MyDayComment;