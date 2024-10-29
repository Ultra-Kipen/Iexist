import { Model, DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  nickname?: string;
  profileImageUrl?: string;
  backgroundImageUrl?: string;
  favoriteQuote?: string;
  themePreference: 'light' | 'dark' | 'system';
  privacySettings: object;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public nickname!: string;
  public profileImageUrl!: string;
  public backgroundImageUrl!: string;
  public favoriteQuote!: string;
  public themePreference!: 'light' | 'dark' | 'system';
  public privacySettings!: object;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 비밀번호 검증 메소드
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export const initUser = (sequelize: Sequelize): void => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(50),
      },
      profileImageUrl: {
        type: DataTypes.STRING(255),
      },
      backgroundImageUrl: {
        type: DataTypes.STRING(255),
      },
      favoriteQuote: {
        type: DataTypes.STRING(255),
      },
      themePreference: {
        type: DataTypes.ENUM('light', 'dark', 'system'),
        defaultValue: 'system',
      },
      privacySettings: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
    },
    {
      sequelize,
      tableName: 'users',
      hooks: {
        beforeSave: async (user: User) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );
};