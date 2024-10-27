// backend/models/EncouragementMessage.ts

import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database'; // 데이터베이스 연결 인스턴스
import User from './User'; // 외래 키 참조 User 모델
import SomeoneDayPost from './SomeoneDayPost'; // 외래 키 참조하는 SomeoneDayPost 모델

class EncouragementMessage extends Model {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public postId!: number;
  public message!: string;
  public isAnonymous!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initialize(sequelize: Sequelize): void {
    EncouragementMessage.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        senderId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: User,
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        receiverId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: User,
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        postId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: SomeoneDayPost,
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        isAnonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
        modelName: 'EncouragementMessage',
        tableName: 'encouragement_messages',
        timestamps: true,
      }
    );
  }

  static associate(models: any): void {
    EncouragementMessage.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender',
    });
    EncouragementMessage.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver',
    });
    EncouragementMessage.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'postId',
      as: 'post',
    });
  }
}

export default EncouragementMessage;
