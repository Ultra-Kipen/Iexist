// backend/models/User.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public nickname?: string;
  public profile_image_url?: string;
  public theme_preference!: 'light' | 'dark' | 'system';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    return this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      nickname: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      profile_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      theme_preference: {
        type: DataTypes.ENUM('light', 'dark', 'system'),
        allowNull: false,
        defaultValue: 'system'
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models: any) {
    if (!models.MyDayPost || !models.SomeoneDayPost) {
      console.warn('MyDayPost 또는 SomeoneDayPost 모델이 없습니다.');
      return;
    }

    // MyDayPost와의 관계
    this.hasMany(models.MyDayPost, {
      as: 'myDayPosts',
      foreignKey: {
        name: 'user_id',
        allowNull: false
      }
    });

    // SomeoneDayPost와의 관계
    this.hasMany(models.SomeoneDayPost, {
      as: 'someoneDayPosts',
      foreignKey: {
        name: 'user_id',
        allowNull: false
      }
    });
  }
}

export default User;