import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

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
  notification_settings: {
    like_notifications: boolean;
    comment_notifications: boolean;
    challenge_notifications: boolean;
    encouragement_notifications: boolean;
  };
  reset_token?: string; // 추가: 비밀번호 재설정 토큰
  reset_token_expires?: Date; // 추가: 비밀번호 재설정 토큰 만료일
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
  public notification_settings!: {
    like_notifications: boolean;
    comment_notifications: boolean;
    challenge_notifications: boolean;
    encouragement_notifications: boolean;
  };
  public reset_token?: string; // 추가: 비밀번호 재설정 토큰
  public reset_token_expires?: Date; // 추가: 비밀번호 재설정 토큰 만료일


  public static initialize(sequelize: Sequelize): typeof User {
    const userModel = User.init(
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
          allowNull: true,
          defaultValue: {} // 빈 객체로 기본값 설정
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
        },
        notification_settings: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {
            like_notifications: true,
            comment_notifications: true,
            challenge_notifications: true,
            encouragement_notifications: true
          }
        },
        reset_token: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: null
        },
        reset_token_expires: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null
        }
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      }
    );
    return userModel;
  }

  // 중복된 associate 메서드 중 하나만 남김
  public static associate(models: any): void {
    User.hasMany(models.MyDayPost, {
      foreignKey: 'user_id',
      as: 'my_day_posts'
    });
  }
}

export type { UserAttributes, UserCreationAttributes };
export default User;