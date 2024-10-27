// backend/models/SomeoneDayLike.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class SomeoneDayLike extends Model {
  public id!: number;
  public post_id!: number;
  public user_id!: number;
  public readonly created_at!: Date;

  static initModel(sequelize: Sequelize) {
    return SomeoneDayLike.init({
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      sequelize,
      tableName: 'someone_day_likes',
      modelName: 'SomeoneDayLike',
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
    SomeoneDayLike.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    SomeoneDayLike.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });
  }
}

export default SomeoneDayLike;