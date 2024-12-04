import { Model, DataTypes, Sequelize, Op } from 'sequelize';
import Challenge from './Challenge';
import { Emotion } from './Emotion';
interface ChallengeEmotionAttributes {
  challenge_emotion_id: number;
  emotion_id: number;
  challenge_id: number;
  user_id: number;
  log_date: Date;
  created_at: Date;
  updated_at: Date;
}

class ChallengeEmotion extends Model<ChallengeEmotionAttributes> {
  public challenge_emotion_id!: number;
  public emotion_id!: number;
  public challenge_id!: number;
  public user_id!: number;
  public log_date!: Date;
  public created_at!: Date;
  public updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    const model = ChallengeEmotion.init(
      {
        challenge_emotion_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
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
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        },
        log_date: {
          type: DataTypes.DATE,
          allowNull: false
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
            fields: ['challenge_id', 'emotion_id', 'user_id']
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

  public static async findByChallenge(
    challengeId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = {
      challenge_id: challengeId
    };

    if (startDate && endDate) {
      where.log_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    return this.findAll({
      where,
      include: ['emotion'],
      order: [['log_date', 'DESC']]
    });
  }
}

export default ChallengeEmotion;