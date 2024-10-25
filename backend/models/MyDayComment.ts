// backend/models/MyDayComment.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayComment extends Model {
  public id!: number;
  public post_id!: number;
  public user_id!: number;
  public content!: string;
  public is_anonymous!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initModel(sequelize: Sequelize) {
    MyDayComment.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'my_day_posts',
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
        allowNull: false,
      },
      is_anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      sequelize,
      tableName: 'my_day_comments',
      modelName: 'MyDayComment',
      timestamps: true,
      underscored: true,
    });

    return MyDayComment;
  }

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    this.belongsTo(models.MyDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });
  }
}

export default MyDayComment;