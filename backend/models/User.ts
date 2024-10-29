import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

// UserAttributes 인터페이스 정의
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  nickname: string | null;
  profileImageUrl: string | null;
  backgroundImageUrl: string | null;
  favoriteQuote: string | null;
  themePreference: 'light' | 'dark' | 'system';
  privacySettings: object;
  createdAt: Date;
  updatedAt: Date;
}

// 생성 시 선택적인 필드 정의
export type UserCreationAttributes = Optional<UserAttributes, 
  'id' | 
  'nickname' | 
  'profileImageUrl' | 
  'backgroundImageUrl' | 
  'favoriteQuote' | 
  'themePreference' | 
  'privacySettings' | 
  'createdAt' | 
  'updatedAt'
>;

// User 클래스 정의
export class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare nickname: string | null;
  declare profileImageUrl: string | null;
  declare backgroundImageUrl: string | null;
  declare favoriteQuote: string | null;
  declare themePreference: 'light' | 'dark' | 'system';
  declare privacySettings: object;
  declare createdAt: Date;
  declare updatedAt: Date;

  // 모델 초기화 메서드
  static initialize(sequelize: Sequelize): void {
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
        profileImageUrl: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        backgroundImageUrl: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        favoriteQuote: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        themePreference: {
          type: DataTypes.ENUM('light', 'dark', 'system'),
          allowNull: false,
          defaultValue: 'system',
        },
        privacySettings: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {},
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
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
      }
    );
  }
}