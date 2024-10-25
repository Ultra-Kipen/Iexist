// backend/models/User.ts

import { Model, DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';

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

  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50]
        }
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
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
    };
  }

  static getTableName() {
    return 'users';
  }

  static getOptions() {
    return {
      hooks: {
        beforeSave: async (user: User) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      }
    };
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  static associate(models: any) {
    this.hasMany(models.MyDayPost, {
      foreignKey: 'user_id',
      as: 'myDayPosts'
    });

    this.hasMany(models.SomeoneDayPost, {
      foreignKey: 'user_id',
      as: 'someoneDayPosts'
    });

    this.hasMany(models.Challenge, {
      foreignKey: 'creator_id',
      as: 'createdChallenges'
    });

    this.hasOne(models.UserStats, {
      foreignKey: 'user_id',
      as: 'stats'
    });

    this.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });
  }
}

export default User;