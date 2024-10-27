// backend/models/Notification.ts

import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database'; // 데이터베이스 연결 인스턴스
import User from './User'; // 외래 키 참조하는 User 모델

class Notification extends Model {
  public id!: number;
  public type!: string;
  public userId!: number;
  public message!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initialize(sequelize: Sequelize): void {
    Notification.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
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
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: true,
      }
    );
  }

  static associate(models: any): void {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

export default Notification;
