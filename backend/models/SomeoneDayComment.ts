// backend/models/SomeoneDayComment.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class SomeoneDayComment extends Model {
  public id!: number;
  public post_id!: number;
  public user_id!: number;
  public content!: string;
  public is_anonymous!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initModel(sequelize: Sequelize) {
    return SomeoneDayComment.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'someone_day_posts',
          key: 'id'
        }
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
        type: DataTypes.STRING(500),
        allowNull: false
      },
      is_anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    }, {
      sequelize,
      tableName: 'someone_day_comments',
      modelName: 'SomeoneDayComment',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models: any) {
    // User 모델과의 관계
    SomeoneDayComment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // SomeoneDayPost 모델과의 관계
    SomeoneDayComment.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });
  }
}

export default SomeoneDayComment;