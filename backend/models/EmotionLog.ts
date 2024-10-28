import { Model, DataTypes, Sequelize } from 'sequelize';

class EmotionLog extends Model {
  public log_id!: number;  // id 대신 log_id 사용
  public user_id!: number;
  public emotion_id!: number;
  public note?: string;
  public log_date!: Date;

  public static initialize(sequelize: Sequelize) {
    return EmotionLog.init(
      {
        log_id: {  // 기본키 필드명 변경
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          field: 'log_id'  // 실제 DB 컬럼명
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

  public static associate(models: any) {
    EmotionLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    EmotionLog.belongsTo(models.Emotion, {
      foreignKey: 'emotion_id',
      as: 'emotion'
    });
  }
}

export default EmotionLog;