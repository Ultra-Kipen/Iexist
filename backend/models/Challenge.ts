// backend/models/Challenge.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class Challenge extends Model {
  public id!: number;
  public creator_id!: number;
  public title!: string;
  public description!: string;
  public start_date!: Date;
  public end_date!: Date;
  public is_public!: boolean;
  public max_participants?: number;
  public participant_count!: number;
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
        creator_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            len: [5, 100]
          }
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            len: [20, 500]
          }
        },
        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: true,
            isAfter: new Date().toString() // 시작일은 현재 날짜 이후여야 함
          }
        },
        end_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: true,
            isAfterStart(value: Date) {
              if (value <= this.start_date) {
                throw new Error('종료일은 시작일 이후여야 합니다.');
              }
            }
          }
        },
        is_public: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        max_participants: {
          type: DataTypes.INTEGER,
          allowNull: true,
          validate: {
            min: 1
          }
        },
        participant_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        sequelize,
        modelName: 'Challenge',
        tableName: 'challenges',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['creator_id']
          },
          {
            fields: ['start_date', 'end_date']
          },
          {
            fields: ['is_public']
          }
        ]
      }
    );
  }

  static associate(models: any): void {
    // Creator와의 관계
    this.belongsTo(models.User, {
      foreignKey: 'creator_id',
      as: 'creator'
    });

    // Participant와의 다대다 관계
    this.belongsToMany(models.User, {
      through: models.ChallengeParticipant,
      foreignKey: 'challenge_id',
      otherKey: 'user_id',
      as: 'participants'
    });

    // ChallengeEmotion과의 관계
    this.hasMany(models.ChallengeEmotion, {
      foreignKey: 'challenge_id',
      as: 'emotions'
    });
  }
}

export default Challenge;
