import { Model, DataTypes, Sequelize } from 'sequelize';

interface EmotionLogAttributes {
  log_id: number;
  user_id: number;
  emotion_id: number;
  log_date: Date;
  note?: string;
}

class EmotionLog extends Model<EmotionLogAttributes> {
  public log_id!: number;
  public user_id!: number;
  public emotion_id!: number;
  public log_date!: Date;
  public note!: string | undefined;

  static initModel(sequelize: Sequelize): typeof EmotionLog {
    EmotionLog.init({
      log_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      emotion_id: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'emotions',
          key: 'emotion_id'
        }
      },
      log_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      note: DataTypes.STRING(200)
    }, {
      sequelize,
      modelName: 'EmotionLog',
      tableName: 'emotion_logs',
      timestamps: false,
      underscored: true,
      indexes: [
        {
          fields: ['user_id', 'log_date']
        }
      ]
    });

    return EmotionLog;
  }

  static associate(models: any): void {
    if (models.User) {
      EmotionLog.belongsTo(models.User, { 
        foreignKey: 'user_id',
        as: 'user'
      });
    }

    if (models.Emotion) {
      EmotionLog.belongsTo(models.Emotion, { 
        foreignKey: 'emotion_id',
        as: 'emotion'
      });
    }
  }
}

export default (sequelize: Sequelize): typeof EmotionLog => {
  return EmotionLog.initModel(sequelize);
};