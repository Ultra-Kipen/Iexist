import { Model, DataTypes, Sequelize } from 'sequelize';

export class ChallengeEmotion extends Model {
  public challenge_emotion_id!: number; // 필드명 수정
  public challenge_id!: number;
  public user_id!: number;
  public emotion_id!: number;
  public note?: string;
  public log_date!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    ChallengeEmotion.init(
      {
        challenge_emotion_id: { // 기존 id를 challenge_emotion_id로 수정
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        challenge_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'challenges',
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
        },
        emotion_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'emotions',
            key: 'id'
          }
        },
        note: {
          type: DataTypes.STRING(500),
          allowNull: true
        },
        log_date: {
          type: DataTypes.DATEONLY,
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
            fields: ['challenge_id', 'user_id', 'log_date'],
            unique: true
          },
          {
            fields: ['emotion_id']
          }
        ]
      }
    );

    return ChallengeEmotion;
  }

  public static associate(models: any) {
    ChallengeEmotion.belongsTo(models.Challenge, {
      foreignKey: 'challenge_id',
      as: 'challenge'
    });

    ChallengeEmotion.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    ChallengeEmotion.belongsTo(models.Emotion, {
      foreignKey: 'emotion_id',
      as: 'emotion'
    });
  }
}

export default ChallengeEmotion;
