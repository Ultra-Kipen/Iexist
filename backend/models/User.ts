import { Model, DataTypes, Sequelize } from 'sequelize';

export class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public nickname?: string;
  public profile_image_url?: string;
  public background_image_url?: string;
  public favorite_quote?: string;
  public theme_preference!: string;
  public privacy_settings?: object;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    const UserModel = User.init(
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
        password_hash: {
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
        background_image_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        favorite_quote: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        theme_preference: {
          type: DataTypes.ENUM('light', 'dark', 'system'),
          defaultValue: 'system',
        },
        privacy_settings: {
          type: DataTypes.JSON,
          allowNull: true,
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

    return UserModel;
  }

  public static associate(models: any) {
    const { Challenge, MyDayPost, SomeoneDayPost } = models;

    User.hasMany(Challenge, {
      foreignKey: 'creator_id',
      as: 'createdChallenges',
    });

    User.belongsToMany(Challenge, {
      through: 'challenge_participants',
      foreignKey: 'user_id',
      as: 'participatingChallenges',
    });

    User.hasMany(MyDayPost, {
      foreignKey: 'user_id',
      as: 'myDayPosts',
    });

    User.hasMany(SomeoneDayPost, {
      foreignKey: 'user_id',
      as: 'someoneDayPosts',
    });
  }
}