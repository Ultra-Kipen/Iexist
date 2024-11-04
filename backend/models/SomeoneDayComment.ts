import { Model, DataTypes, Sequelize } from 'sequelize';
import { User } from '../models/User';
import  SomeoneDayPost from '../models/SomeoneDayPost';

interface SomeoneDayCommentAttributes {
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  is_anonymous: boolean;
}

class SomeoneDayComment extends Model<SomeoneDayCommentAttributes> {
  public comment_id!: number;
  public post_id!: number;
  public user_id!: number;
  public content!: string;
  public is_anonymous!: boolean;

  public static initialize(sequelize: Sequelize) {
    const model = SomeoneDayComment.init(
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
            model: 'someone_day_posts',
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
          allowNull: false,
          defaultValue: false
        }
      },
      {
        sequelize,
        modelName: 'SomeoneDayComment',
        tableName: 'someone_day_comments',
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

  public static associate(models: {
    User: typeof User;
    SomeoneDayPost: typeof SomeoneDayPost;
  }): void {
    SomeoneDayComment.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });

    SomeoneDayComment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

export default SomeoneDayComment;