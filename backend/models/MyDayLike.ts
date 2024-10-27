// backend/models/MyDayLike.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayLike extends Model {
  public id!: number;
  public post_id!: number;
  public user_id!: number;
  public readonly created_at!: Date;

  static initialize(sequelize: Sequelize) {
    return this.init(
      {
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
        }
      },
      {
        sequelize,
        modelName: 'MyDayLike',
        tableName: 'my_day_likes',
        timestamps: true,
        updatedAt: false,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['post_id', 'user_id']
          }
        ]
      }
    );
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

export default MyDayLike;