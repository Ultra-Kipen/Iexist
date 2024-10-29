import { Model, DataTypes, Sequelize } from 'sequelize';

interface UserAttributes {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  nickname: string;
  profile_image_url?: string;
  theme_preference: 'light' | 'dark' | 'system';
  created_at: Date;
  updated_at: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public user_id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public nickname!: string;
  public profile_image_url?: string;
  public theme_preference!: 'light' | 'dark' | 'system';
  public created_at!: Date;
  public updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    User.init({
      user_id: {
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
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      profile_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      theme_preference: {
        type: DataTypes.ENUM('light', 'dark', 'system'),
        allowNull: false,
        defaultValue: 'light',
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
    }, {
      sequelize,
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  }
}

export { User, UserAttributes };