// backend/models/ChallengeEmotion.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class ChallengeEmotion extends Model {
  public id!: number;
  public challenge_id!: number;
  public user_id!: number;
  public emotion_id!: number;
  public note?: string;
  public log_date!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static init(sequelize: Sequelize): void {
    super.init(
      {
        id: {
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
  }

  static associate(models: any): void {
    // Challenge와의 관계
    this.belongsTo(models.Challenge, {
      foreignKey: 'challenge_id',
      as: 'challenge'
    });

    // User와의 관계
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Emotion과의 관계
    this.belongsTo(models.Emotion, {
      foreignKey: 'emotion_id',
      as: 'emotion'
    });
  }
}

export default ChallengeEmotion;
