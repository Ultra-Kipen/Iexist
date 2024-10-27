// backend/models/Challenge.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

export class Challenge extends Model {
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

  public static initialize(sequelize: Sequelize) {
    Challenge.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        creator_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        start_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        end_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        is_public: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        max_participants: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        participant_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        }
      },
      {
        sequelize,
        modelName: 'Challenge',
        tableName: 'challenges',
        timestamps: true,
        underscored: true,
      }
    );

    return Challenge;
  }

  public static associate(models: any) {
    Challenge.belongsTo(models.User, {
      foreignKey: 'creator_id',
      as: 'creator',
    });

    Challenge.belongsToMany(models.User, {
      through: 'challenge_participants',
      foreignKey: 'challenge_id',
      as: 'participants',
    });
  }
}

export default Challenge;
