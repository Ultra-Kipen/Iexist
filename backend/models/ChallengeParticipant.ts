import { Model, DataTypes, Sequelize } from 'sequelize';

class ChallengeParticipant extends Model {
  public challenge_id!: number;
  public user_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    return ChallengeParticipant.init(
      {
        challenge_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'challenges',
            key: 'challenge_id'
          },
          onDelete: 'CASCADE'
        },
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          },
          onDelete: 'CASCADE'
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
        modelName: 'ChallengeParticipant',
        tableName: 'challenge_participants',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['challenge_id']
          },
          {
            fields: ['user_id']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    // 관계는 Challenge와 User 모델에서 정의됨
  }
}

export default ChallengeParticipant;