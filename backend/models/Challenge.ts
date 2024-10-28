import { Model, DataTypes, Sequelize } from 'sequelize';

class Challenge extends Model {
  public challenge_id!: number;
  public creator_id!: number;
  public title!: string;
  public description?: string;
  public start_date!: Date;
  public end_date!: Date;
  public is_public!: boolean;
  public max_participants?: number;
  public participant_count!: number;

  public static initialize(sequelize: Sequelize) {
    return Challenge.init(
      {
        challenge_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          field: 'challenge_id'  // 실제 DB 컬럼명과 일치
        },
        creator_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        end_date: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        is_public: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        max_participants: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true
        },
        participant_count: {
          type: DataTypes.SMALLINT.UNSIGNED,
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
        freezeTableName: true,
        indexes: [
          {
            fields: ['creator_id']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    Challenge.belongsTo(models.User, {
      foreignKey: 'creator_id',
      as: 'creator'
    });

    Challenge.belongsToMany(models.User, {
      through: 'challenge_participants',
      foreignKey: 'challenge_id',
      otherKey: 'user_id',
      as: 'participants'
    });

    Challenge.belongsToMany(models.Emotion, {
      through: 'challenge_emotions',
      foreignKey: 'challenge_id',
      otherKey: 'emotion_id',
      as: 'emotions'
    });
  }
}

export default Challenge;