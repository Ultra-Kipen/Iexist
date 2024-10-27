// backend/models/UserStats.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class UserStats extends Model {
  public id!: number;
  public user_id!: number;
  public my_day_post_count!: number;
  public someone_day_post_count!: number;
  public my_day_like_received_count!: number;
  public someone_day_like_received_count!: number;
  public my_day_comment_received_count!: number;
  public someone_day_comment_received_count!: number;
  public challenge_count!: number;
  public readonly last_updated!: Date;

  static init(sequelize: Sequelize): void {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        my_day_post_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        someone_day_post_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        my_day_like_received_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        someone_day_like_received_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        my_day_comment_received_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        someone_day_comment_received_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        challenge_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        last_updated: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'UserStats',
        tableName: 'user_stats',
        timestamps: false,
        underscored: true
      }
    );
  }

  static associate(models: any): void {
    // User와의 1:1 관계
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

export default UserStats;
