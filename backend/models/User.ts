import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { EmotionLog } from './EmotionLog';
import MyDayPost from './MyDayPost';
import Challenge from './Challenge';
import MyDayComment from './MyDayComment';
import MyDayLike from './MyDayLike';
import SomeoneDayPost from './SomeoneDayPost';
import SomeoneDayComment from './SomeoneDayComment';
import SomeoneDayLike from './SomeoneDayLike';

export type ThemePreference = 'light' | 'dark' | 'system';

interface UserAttributes {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;      // password -> password_hash
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

interface UserCreationAttributes extends Omit<UserAttributes, 'user_id' | 'created_at' | 'updated_at'> {}

// User 클래스에 필드 추가
class User extends Model<UserAttributes, UserCreationAttributes> {
  // 기존 필드들 유지
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
  public is_active!: boolean;     // 추가
  public last_login_at?: Date;    // 추가
  public created_at!: Date;
  public updated_at!: Date;


  // 관계 타입 선언은 그대로 유지...

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
        is_active: {          // 추가
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        last_login_at: {      // 추가
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
      }
    );
  }

  // 관계 설정 메서드는 그대로 유지...

  public toJSON(): Omit<UserAttributes, 'password_hash'> {
    const values = this.get() as UserAttributes;
    const { password_hash, ...rest } = values;
    return rest;
  }

  public async updateProfile(data: Partial<UserAttributes>): Promise<void> {
    const updateData: Partial<UserAttributes> = {};
    
    if ('nickname' in data) updateData.nickname = data.nickname;
    if ('theme_preference' in data) updateData.theme_preference = data.theme_preference;
    if ('profile_image_url' in data) updateData.profile_image_url = data.profile_image_url;
    if ('background_image_url' in data) updateData.background_image_url = data.background_image_url;
    if ('favorite_quote' in data) updateData.favorite_quote = data.favorite_quote;
    if ('privacy_settings' in data) updateData.privacy_settings = data.privacy_settings;

    await this.update(updateData);
  }

  public async toggleActive(): Promise<void> {
    const is_active = !this.get('is_active');
    await this.update({ is_active });
  }

  public async updateLastLogin(): Promise<void> {
    await this.update({ last_login_at: new Date() });
  }

    public static associate(models: any): void {
      // 감정 로그 관계
      User.hasMany(models.EmotionLog, {
        foreignKey: 'user_id',
        as: 'emotionLogs',
        onDelete: 'CASCADE'
      });
  
      // MyDay 게시물 관계
      User.hasMany(models.MyDayPost, {
        foreignKey: 'user_id',
        as: 'myDayPosts',
        onDelete: 'CASCADE'
      });
  
      // SomeoneDay 게시물 관계
      User.hasMany(models.SomeoneDayPost, {
        foreignKey: 'user_id',
        as: 'someoneDayPosts',
        onDelete: 'CASCADE'
      });
  
      // 챌린지 참여 관계
      User.belongsToMany(models.Challenge, {
        through: 'challenge_participants',
        foreignKey: 'user_id',
        otherKey: 'challenge_id',
        as: 'challenges'
      });
  
      // MyDay 댓글 관계
      User.hasMany(models.MyDayComment, {
        foreignKey: 'user_id',
        as: 'myDayComments',
        onDelete: 'CASCADE'
      });
  
      // SomeoneDay 댓글 관계
      User.hasMany(models.SomeoneDayComment, {
        foreignKey: 'user_id',
        as: 'someoneDayComments',
        onDelete: 'CASCADE'
      });
  
      // MyDay 좋아요 관계
      User.hasMany(models.MyDayLike, {
        foreignKey: 'user_id',
        as: 'myDayLikes',
        onDelete: 'CASCADE'
      });
  
      // SomeoneDay 좋아요 관계
      User.hasMany(models.SomeoneDayLike, {
        foreignKey: 'user_id',
        as: 'someoneDayLikes',
        onDelete: 'CASCADE'
      });
    }
  } // class User 닫는 중괄호 추가


export { User };
export type { UserAttributes, UserCreationAttributes };
export default User;