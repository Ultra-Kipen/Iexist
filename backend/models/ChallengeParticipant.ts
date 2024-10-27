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
        joined_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        last_progress_update: {
          type: DataTypes.DATE,
          allowNull: true
        },
        progress_note: {
          type: DataTypes.STRING(500),
          allowNull: true
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
  }
}

export default ChallengeParticipant;
