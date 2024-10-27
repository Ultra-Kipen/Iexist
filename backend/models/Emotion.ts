// backend/models/Emotion.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class Emotion extends Model {
  public id!: number;
  public name!: string;
  public icon!: string;
  public color?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    return this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
      underscored: true
    });
  }

  static associate(models: any) {
    if (!models.EmotionLog || !models.MyDayPost) {
      console.warn('Required models are not initialized');
      return;
    }

    // EmotionLog와의 관계
    this.hasMany(models.EmotionLog, {
      as: 'logs',
      foreignKey: {
        name: 'emotion_id',
        allowNull: false
      }
    });

    // MyDayPost와의 다대다 관계
    this.belongsToMany(models.MyDayPost, {
      through: 'emotion_posts',
      as: 'posts',
      foreignKey: {
        name: 'emotion_id',
        allowNull: false
      },
      otherKey: {
        name: 'post_id',
        allowNull: false
      }
    });
  }
}

export default Emotion;