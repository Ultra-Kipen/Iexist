import { Model, DataTypes, Sequelize } from 'sequelize';

export interface EmotionAttributes {
  emotion_id: number;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EmotionCreationAttributes = Omit<EmotionAttributes, 'emotion_id' | 'createdAt' | 'updatedAt'>;

export class Emotion extends Model<EmotionAttributes, EmotionCreationAttributes> {
  declare emotion_id: number;
  declare name: string;
  declare icon: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize): void {
    Emotion.init(
      {
        emotion_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        icon: {
          type: DataTypes.STRING(10),
          allowNull: false,
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
        tableName: 'emotions',
        timestamps: true,
      }
    );
  }
}