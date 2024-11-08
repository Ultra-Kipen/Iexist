// backend/models/ChallengeEmotion.ts
import { Model, DataTypes, Sequelize, Op } from 'sequelize';
import Challenge from './Challenge';
import { Emotion } from './Emotion';

interface ChallengeEmotionAttributes {
  emotion_id: number;
  challenge_id: number;
  created_at: Date;
  updated_at: Date;
}

class ChallengeEmotion extends Model<ChallengeEmotionAttributes> {
  public emotion_id!: number;
  public challenge_id!: number;
  public created_at!: Date;
  public updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    const model = ChallengeEmotion.init(
      {
        emotion_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'emotions',
            key: 'emotion_id'
          }
        },
        challenge_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'challenges',
            key: 'challenge_id'
          }
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'ChallengeEmotion',
        tableName: 'challenge_emotions',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            name: 'challenge_emotions_index',
            fields: ['challenge_id', 'emotion_id']
          }
        ]
      }
    );
    return model;
  }

  public static associate(models: {
    Challenge: typeof Challenge;
    Emotion: typeof Emotion;
  }): void {
    ChallengeEmotion.belongsTo(models.Challenge, {
      foreignKey: 'challenge_id',
      as: 'challenge'
    });

    ChallengeEmotion.belongsTo(models.Emotion, {
      foreignKey: 'emotion_id',
      as: 'emotion'
    });
  }

  // 감정 로그 조회 메서드
  public static async findByChallenge(
    challengeId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = {
      challenge_id: challengeId
    };

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [startDate, endDate]
      };
    }

    return this.findAll({
      where,
      include: ['emotion'],
      order: [['created_at', 'DESC']]
    });
  }
}

export default ChallengeEmotion;