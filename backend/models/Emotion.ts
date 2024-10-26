// backend/models/Emotion.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class Emotion extends Model {
  public id!: number;
  public name!: string;
  public icon!: string;
  public color?: string;
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
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true
        },
        icon: {
          type: DataTypes.STRING(50),
          allowNull: false,
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
        underscored: true
      }
    );
  }

  static associate(models: any): void {
    // MyDayPost와의 다대다 관계
    this.belongsToMany(models.MyDayPost, {
      through: 'my_day_emotions',
      foreignKey: 'emotion_id',
      otherKey: 'post_id',
      as: 'myDayPosts'
    });

    // EmotionLog와의 관계
    this.hasMany(models.EmotionLog, {
      foreignKey: 'emotion_id',
      as: 'emotionLogs'
    });

    // Challenge와의 다대다 관계
    this.belongsToMany(models.Challenge, {
      through: 'challenge_emotions',
      foreignKey: 'emotion_id',
      otherKey: 'challenge_id',
      as: 'challenges'
    });
  }
}

export default Emotion;
