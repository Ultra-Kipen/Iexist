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

  static initModel(sequelize: Sequelize) {
    return ChallengeEmotion.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
        defaultValue: Sequelize.literal('CURRENT_DATE')
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    }, {
      sequelize,
      tableName: 'challenge_emotions',
      modelName: 'ChallengeEmotion',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['challenge_id', 'user_id', 'log_date']
        }
      ]
    });
  }

  static associate(models: any) {
    ChallengeEmotion.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    ChallengeEmotion.belongsTo(models.Challenge, {
      foreignKey: 'challenge_id',
      as: 'challenge'
    });

    ChallengeEmotion.belongsTo(models.Emotion, {
      foreignKey: 'emotion_id',
      as: 'emotion'
    });
  }
}

export default ChallengeEmotion;