import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import sequelize from '../config/database';

export type ThemePreference = 'light' | 'dark' | 'system';

interface UserAttributes {

  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  nickname?: string;
  profile_image_url?: string;
  background_image_url?: string;
  favorite_quote?: string;
  theme_preference?: ThemePreference;
  privacy_settings?: JSON;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> {
  public user_id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public nickname?: string;
  public profile_image_url?: string;
  public background_image_url?: string;
  public favorite_quote?: string;
  public theme_preference?: ThemePreference;
  public privacy_settings?: JSON;
  public is_active!: boolean;
  public last_login_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;
  public static initialize(sequelize: Sequelize): typeof User {
    return User.init(
      {
        user_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          field: 'user_id'
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true,
            len: [2, 50]
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
        password_hash: {
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
        background_image_url: {
          type: DataTypes.STRING(255), 
          allowNull: true
        },
        favorite_quote: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        theme_preference: {
          type: DataTypes.ENUM('light', 'dark', 'system'),
          allowNull: true,
          defaultValue: 'system'
        },
        privacy_settings: {
          type: DataTypes.JSON,
          allowNull: true
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        last_login_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true
      }
    );
  }
}

export type { UserAttributes, UserCreationAttributes };
export default User;