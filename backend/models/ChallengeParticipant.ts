import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database'; // 데이터베이스 연결 인스턴스
import User from './User'; // 외래 키로 참조하는 User 모델
import Challenge from './Challenge'; // 외래 키로 참조하는 Challenge 모델

class ChallengeParticipant extends Model {
  public id!: number;
  public userId!: number;
  public challengeId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initialize(sequelize: Sequelize): void {
    ChallengeParticipant.init(
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
        sequelize, // 인스턴스 전달
        modelName: 'ChallengeParticipant',
        tableName: 'challenge_participants',
        timestamps: true,
      }
    );
  }

  static associate(models: any): void {
    ChallengeParticipant.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    ChallengeParticipant.belongsTo(models.Challenge, {
      foreignKey: 'challengeId',
      as: 'challenge',
    });
  }
}

export default ChallengeParticipant;
