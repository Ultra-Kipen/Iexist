import { Model, DataTypes, Sequelize } from 'sequelize';

class Emotion extends Model {
  public emotion_id!: number;  // id에서 emotion_id로 변경
  public name!: string;
  public icon!: string;
  public color?: string;

  public static initialize(sequelize: Sequelize) {
    return Emotion.init(
      {
        emotion_id: {  // 기본키 필드명 변경
          type: DataTypes.TINYINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          field: 'emotion_id'  // 실제 DB 컬럼명 명시
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true
        },
        icon: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        color: {
          type: DataTypes.STRING(7),
          allowNull: true,
          validate: {
            is: /^#[0-9A-Fa-f]{6}$/
          }
        }
      },
      {
        sequelize,
        modelName: 'Emotion',
        tableName: 'emotions',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['name']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    const { MyDayPost, Challenge, EmotionLog } = models;

    if (MyDayPost) {
      Emotion.belongsToMany(MyDayPost, {
        through: 'my_day_emotions',
        foreignKey: 'emotion_id',
        otherKey: 'post_id',
        as: 'myDayPosts'
      });
    }

    if (Challenge) {
      Emotion.belongsToMany(Challenge, {
        through: 'challenge_emotions',
        foreignKey: 'emotion_id',
        otherKey: 'challenge_id',
        as: 'challenges'
      });
    }

    if (EmotionLog) {
      Emotion.hasMany(EmotionLog, {
        foreignKey: 'emotion_id',
        as: 'emotionLogs'
      });
    }
  }
}

export default Emotion;