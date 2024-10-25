// backend/models/ChallengeParticipant.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class ChallengeParticipant extends Model {
  public id!: number;
  public challenge_id!: number;
  public user_id!: number;
  public joined_at!: Date;
  public last_progress_update?: Date;
  public progress_note?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initModel(sequelize: Sequelize) {
    return ChallengeParticipant.init({
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
      joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      last_progress_update: {
        type: DataTypes.DATE,
        allowNull: true
      },
      progress_note: {
        type: DataTypes.STRING(500),
        allowNull: true
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
      tableName: 'challenge_participants',
      modelName: 'ChallengeParticipant',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['challenge_id', 'user_id']
        }
      ]
    });
  }

  static associate(models: any) {
    ChallengeParticipant.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    ChallengeParticipant.belongsTo(models.Challenge, {
      foreignKey: 'challenge_id',
      as: 'challenge'
    });
  }
}

export default ChallengeParticipant;