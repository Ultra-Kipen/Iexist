import { Model, DataTypes, Sequelize } from 'sequelize';
import { User } from '../models/User';
import { Emotion } from '../models/Emotion';
interface ChallengeAttributes {
  challenge_id?: number;  
  creator_id: number;
  title: string;
  description: string | null;
  start_date: Date;
  end_date: Date;
  is_public: boolean;
  max_participants: number | null;
  participant_count: number;
  created_at?: Date;
  updated_at?: Date;
}

class Challenge extends Model<ChallengeAttributes> {
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
        primaryKey: true
      },
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onDelete: 'CASCADE', // 변경 - CASCADE 제약 추가
        onUpdate: 'CASCADE'  // 변경 - CASCADE 제약 추가
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
        type: DataTypes.INTEGER,
        allowNull: true
      },
      participant_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
      modelName: 'Challenge',
      tableName: 'challenges',
      timestamps: true,
      underscored: true
    }
  );
}
public static associate(models: {
  User: typeof User;
  Emotion: typeof Emotion;
  ChallengeParticipant: any;
}): void {
  Challenge.belongsTo(models.User, {
    foreignKey: 'creator_id',
    as: 'creator'
  });

  Challenge.hasMany(models.ChallengeParticipant, {
    foreignKey: 'challenge_id',
    as: 'challenge_participants'
  });

  Challenge.belongsToMany(models.User, {
    through: models.ChallengeParticipant,
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