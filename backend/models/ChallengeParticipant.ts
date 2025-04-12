// ChallengeParticipant.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import { User } from '../models/User';
import Challenge from '../models/Challenge';

interface ChallengeParticipantAttributes {
  challenge_id: number;
  user_id: number;
  created_at?: Date;
}

class ChallengeParticipant extends Model<ChallengeParticipantAttributes> {
  public challenge_id!: number;
  public user_id!: number;
  public created_at!: Date;

  public static initialize(sequelize: Sequelize) {
    const model = ChallengeParticipant.init(
      {
        challenge_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'challenges',
            key: 'challenge_id'
          },
          onDelete: 'CASCADE', // 변경 - CASCADE 제약 추가
          onUpdate: 'CASCADE'  // 변경 - CASCADE 제약 추가
        },
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          },
          onDelete: 'CASCADE', // 변경 - CASCADE 제약 추가
          onUpdate: 'CASCADE'  // 변경 - CASCADE 제약 추가
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'ChallengeParticipant',
        tableName: 'challenge_participants',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['challenge_id', 'user_id']
          }
        ]
      }
    );
    return model;
  }

  public static associate(models: any): void {
    ChallengeParticipant.belongsTo(models.Challenge, {
      foreignKey: 'challenge_id',
      targetKey: 'challenge_id'
    });
    ChallengeParticipant.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'user_id'
    });
  }
}

export default ChallengeParticipant;