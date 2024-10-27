// backend/models/UserStats.ts

import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database'; // 데이터베이스 연결 인스턴스
import User from './User'; // 외래 키 참조하는 User 모델

class UserStats extends Model {
  public id!: number;
  public userId!: number;
  public postsCount!: number;
  public likesReceived!: number;
  public commentsReceived!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initialize(sequelize: Sequelize): void {
    UserStats.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: User,
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        postsCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        likesReceived: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        commentsReceived: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'UserStats',
        tableName: 'user_stats',
        timestamps: true,
      }
    );
  }

  static associate(models: any): void {
    UserStats.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

export default UserStats;
