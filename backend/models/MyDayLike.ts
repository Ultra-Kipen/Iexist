// backend/models/MyDayLike.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayLike extends Model {
  public id!: number;
  public post_id!: number;
  public user_id!: number;
  public readonly created_at!: Date;

  static initModel(sequelize: Sequelize) {
    return MyDayLike.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      sequelize,
      tableName: 'my_day_likes',
      modelName: 'MyDayLike',
      timestamps: true,
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['post_id', 'user_id']
        }
      ]
    });
  }

  static associate(models: any) {
    // User 모델과의 관계
    MyDayLike.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // MyDayPost 모델과의 관계
    MyDayLike.belongsTo(models.MyDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });
  }
}

export default MyDayLike;