import { Model, DataTypes, Sequelize } from 'sequelize';

interface EmotionAttributes {
  emotion_id: number;
  name: string;
  icon: string;
}

class Emotion extends Model<EmotionAttributes> implements EmotionAttributes {
  public emotion_id!: number;
  public name!: string;
  public icon!: string;

  static initModel(sequelize: Sequelize): typeof Emotion {
    Emotion.init({
      emotion_id: {
        type: DataTypes.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      icon: {
        type: DataTypes.STRING(10),
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Emotion',
      tableName: 'emotions',
      timestamps: false,
      underscored: true
    });

    return Emotion;
  }

  static associate(models: any): void {
    Emotion.belongsToMany(models.MyDayPost, {
      through: 'my_day_emotions',
      foreignKey: 'emotion_id'
    });
    Emotion.hasMany(models.EmotionLog, {
      foreignKey: 'emotion_id'
    });
  }
}

export default (sequelize: Sequelize): typeof Emotion => {
  return Emotion.initModel(sequelize);
};