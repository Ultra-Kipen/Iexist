// backend/models/User.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  nickname?: string;
  profile_image_url?: string;
  theme_preference: 'light' | 'dark' | 'system';
  created_at?: Date;
  updated_at?: Date;
}

class User extends Model<UserAttributes> {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public nickname?: string;
  public profile_image_url?: string;
  public theme_preference!: 'light' | 'dark' | 'system';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 모델 초기화
  public static initialize(sequelize: Sequelize): void {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        nickname: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        profile_image_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        theme_preference: {
          type: DataTypes.ENUM('light', 'dark', 'system'),
          allowNull: false,
          defaultValue: 'system',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
      }
    );
  }

  // 관계 설정
  public static associate(models: any): void {
    this.hasMany(models.MyDayPost, {
      foreignKey: 'user_id',
      as: 'myDayPosts',
    });

    this.hasMany(models.SomeoneDayPost, {
      foreignKey: 'user_id',
      as: 'someoneDayPosts',
    });
  }
}

export default User;