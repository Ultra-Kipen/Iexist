import { Model, DataTypes, Sequelize } from 'sequelize';

class EmotionLog extends Model {
  public id!: number;
  public user_id!: number;
  public emotion_id!: number;
  public note?: string;
  public log_date!: Date;

  public static initialize(sequelize: Sequelize) {
    const model = EmotionLog.init(
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

    return model;
  }

  public static associate(models: any) {
    const { User, Emotion } = models;

    if (User && Emotion) {
      EmotionLog.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      EmotionLog.belongsTo(Emotion, {
        foreignKey: 'emotion_id',
        as: 'emotion'
      });
    }
  }
}

export default EmotionLog;