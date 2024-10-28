import { Model, DataTypes, Sequelize } from 'sequelize';

class ChallengeParticipant extends Model {
  public challenge_id!: number;
  public user_id!: number;
  public joined_at!: Date;
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
          }
        },
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        },
        joined_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false
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
            fields: ['user_id']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    const { User, Challenge } = models;

    if (User && Challenge) {
      // 관계는 User와 Challenge 모델에서 정의됨
      // 여기서는 추가적인 관계 설정이 필요 없음
    }
  }
}

export default ChallengeParticipant;