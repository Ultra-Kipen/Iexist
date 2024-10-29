import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { EmotionLog } from './EmotionLog';
import { Post } from './Post';
import { Challenge } from './Challenge';
import { Comment } from './Comment';
import { Like } from './Like';

export type ThemePreference = 'light' | 'dark' | 'system';

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  nickname?: string;
  theme_preference?: ThemePreference;
  profile_image_url?: string;
  is_active: boolean;
  last_login_at?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'is_active'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public nickname!: string | undefined;
  public theme_preference!: ThemePreference | undefined;
  public profile_image_url!: string | undefined;
  public is_active!: boolean;
  public last_login_at!: Date | undefined;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 관계 타입 선언
  public readonly emotionLogs?: EmotionLog[];
  public readonly posts?: Post[];
  public readonly challenges?: Challenge[];
  public readonly comments?: Comment[];
  public readonly likes?: Like[];

  // 관계 선언
  public static associations: {
    emotionLogs: Association<User, EmotionLog>;
    posts: Association<User, Post>;
    challenges: Association<User, Challenge>;
    comments: Association<User, Comment>;
    likes: Association<User, Like>;
  };

  // 모델 초기화 메서드
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
          validate: {
            notEmpty: true,
            len: [2, 50],
          },
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
            notEmpty: true,
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [6, 100],
          },
        },
        nickname: {
          type: DataTypes.STRING(50),
          allowNull: true,
          validate: {
            len: [2, 50],
          },
        },
        theme_preference: {
          type: DataTypes.ENUM('light', 'dark', 'system'),
          allowNull: true,
          defaultValue: 'system',
          validate: {
            isIn: [['light', 'dark', 'system']],
          },
        },
        profile_image_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
          validate: {
            isUrl: true,
          },
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        last_login_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['email'],
          },
          {
            fields: ['username'],
          },
          {
            fields: ['is_active'],
          },
        ],
        defaultScope: {
          attributes: {
            exclude: ['password'],
          },
          where: {
            is_active: true,
          },
        },
        scopes: {
          withPassword: {
            attributes: {
              include: ['password'],
            },
          },
          withInactive: {
            where: {},
          },
        },
      }
    );
  }

  // 관계 설정 메서드
  public static associate(models: any): void {
    // 감정 로그 관계
    User.hasMany(models.EmotionLog, {
      foreignKey: {
        name: 'user_id',
        allowNull: false,
      },
      as: 'emotionLogs',
      onDelete: 'CASCADE',
    });

    // 게시물 관계
    User.hasMany(models.Post, {
      foreignKey: {
        name: 'user_id',
        allowNull: false,
      },
      as: 'posts',
      onDelete: 'CASCADE',
    });

    // 챌린지 참여 관계
    User.belongsToMany(models.Challenge, {
      through: 'challenge_participants',
      foreignKey: 'user_id',
      otherKey: 'challenge_id',
      as: 'challenges',
    });

    // 댓글 관계
    User.hasMany(models.Comment, {
      foreignKey: {
        name: 'user_id',
        allowNull: false,
      },
      as: 'comments',
      onDelete: 'CASCADE',
    });

    // 좋아요 관계
    User.hasMany(models.Like, {
      foreignKey: {
        name: 'user_id',
        allowNull: false,
      },
      as: 'likes',
      onDelete: 'CASCADE',
    });
  }

  // 인스턴스 메서드
  public toJSON(): object {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }

  // 사용자 활성화 상태 변경 메서드
  public async toggleActive(): Promise<void> {
    this.is_active = !this.is_active;
    await this.save();
  }

  // 마지막 로그인 시간 업데이트 메서드
  public async updateLastLogin(): Promise<void> {
    this.last_login_at = new Date();
    await this.save();
  }

  // 프로필 업데이트 메서드
  public async updateProfile(data: Partial<UserAttributes>): Promise<void> {
    const allowedFields = ['nickname', 'theme_preference', 'profile_image_url'];
    const updateData = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    await this.update(updateData);
  }
}

export default User;