import { Model, DataTypes, Sequelize } from 'sequelize';

class User extends Model {
  public user_id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public nickname?: string;
  public profile_image_url?: string;
  public background_image_url?: string;
  public favorite_quote?: string;
  public theme_preference?: string;
  public privacy_settings?: object;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
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
          unique: true
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true
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
        underscored: true,
        freezeTableName: true,
        indexes: [
          {
            unique: true,
            fields: ['username']
          },
          {
            unique: true,
            fields: ['email']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    const { Challenge, MyDayPost, SomeoneDayPost } = models;

    User.hasMany(Challenge, {
      foreignKey: 'creator_id',
      sourceKey: 'user_id',
      as: 'createdChallenges'
    });

    User.hasMany(MyDayPost, {
      foreignKey: 'user_id',
      sourceKey: 'user_id',
      as: 'myDayPosts'
    });

    User.hasMany(SomeoneDayPost, {
      foreignKey: 'user_id',
      sourceKey: 'user_id',
      as: 'someoneDayPosts'
    });
  }
}

export default User;