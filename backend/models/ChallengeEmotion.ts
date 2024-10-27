// backend/models/ChallengeEmotion.ts

import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database'; // 데이터베이스 인스턴스
import Challenge from './Challenge'; // 외래 키 참조하는 Challenge 모델
import User from './User'; // 외래 키 참조하는 User 모델
import Emotion from './Emotion'; // 외래 키 참조하는 Emotion 모델

class ChallengeEmotion extends Model {
  public id!: number;
  public challengeId!: number;
  public userId!: number;
  public emotionId!: number;
  public note?: string;
  public logDate!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initialize(sequelize: Sequelize): void {
    ChallengeEmotion.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        challengeId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: Challenge,
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
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
        emotionId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: Emotion,
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        note: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        logDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          defaultValue: DataTypes.NOW,
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
        modelName: 'ChallengeEmotion',
        tableName: 'challenge_emotions',
        timestamps: true,
      }
    );
  }

  static associate(models: any): void {
    ChallengeEmotion.belongsTo(models.Challenge, {
      foreignKey: 'challengeId',
      as: 'challenge',
    });
    ChallengeEmotion.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    ChallengeEmotion.belongsTo(models.Emotion, {
      foreignKey: 'emotionId',
      as: 'emotion',
    });
  }
}

export default ChallengeEmotion;
