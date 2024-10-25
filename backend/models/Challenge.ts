import { Model, DataTypes, Sequelize } from 'sequelize';

interface ChallengeAttributes {
  challenge_id: number;
  creator_id: number;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  is_public: boolean;
  max_participants?: number;
  participant_count: number;
  created_at: Date;
}

class Challenge extends Model<ChallengeAttributes> {
  public challenge_id!: number;
  public creator_id!: number;
  public title!: string;
  public description!: string | undefined;
  public start_date!: Date;
  public end_date!: Date;
  public is_public!: boolean;
  public max_participants!: number | undefined;
  public participant_count!: number;
  public created_at!: Date;

  static initModel(sequelize: Sequelize): typeof Challenge {
    Challenge.init({
      challenge_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: DataTypes.TEXT,
      start_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      max_participants: DataTypes.SMALLINT.UNSIGNED,
      participant_count: {
        type: DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'Challenge',
      tableName: 'challenges',
      timestamps: true,
      underscored: true
    });

    return Challenge;
  }

  static associate(models: any): void {
    Challenge.belongsTo(models.User, {
      as: 'Creator',
      foreignKey: 'creator_id'
    });
    // ChallengeParticipant와 ChallengeEmotion 모델이 정의된 후에만 관계 설정
    if (models.ChallengeParticipant) {
      Challenge.hasMany(models.ChallengeParticipant, {
        foreignKey: 'challenge_id',
        as: 'Participants'
      });
    }
    if (models.ChallengeEmotion) {
      Challenge.hasMany(models.ChallengeEmotion, {
        foreignKey: 'challenge_id',
        as: 'Emotions'
      });
    }
  }
}

export default (sequelize: Sequelize): typeof Challenge => {
  return Challenge.initModel(sequelize);
};