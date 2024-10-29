import { Model, DataTypes, Sequelize } from 'sequelize';

export interface EmotionLogAttributes {
  log_id: number;
  user_id: number;
  emotion_id: number;
  log_date: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type EmotionLogCreationAttributes = Omit<EmotionLogAttributes, 'log_id' | 'createdAt' | 'updatedAt'>;

export class EmotionLog extends Model<EmotionLogAttributes, EmotionLogCreationAttributes> {
  declare log_id: number;
  declare user_id: number;
  declare emotion_id: number;
  declare log_date: Date;
  declare note: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize): void {
    EmotionLog.init(
      {
        log_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        emotion_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'emotions',
            key: 'emotion_id',
          },
        },
        log_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        note: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'emotion_logs',
        timestamps: true,
      }
    );
  }
}