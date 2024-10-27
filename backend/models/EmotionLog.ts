// backend/models/EmotionLog.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class EmotionLog extends Model {
  public id!: number;
  public user_id!: number;
  public emotion_id!: number;
  public note?: string;
  public log_date!: Date;
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
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        emotion_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'emotions',
            key: 'id'
          }
        },
        note: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        log_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'EmotionLog',
        tableName: 'emotion_logs',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['user_id', 'log_date']
          },
          {
            fields: ['emotion_id']
          }
        ]
      }
    );
  }

  static associate(models: any): void {
    // User와의 관계
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Emotion과의 관계
    this.belongsTo(models.Emotion, {
      foreignKey: 'emotion_id',
      as: 'emotion'
    });
  }
}

export default EmotionLog;
