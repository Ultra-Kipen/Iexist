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
  password: string;
  nickname?: string;
  theme_preference?: ThemePreference;
  profile_image_url?: string;
  is_active: boolean;
  last_login_at?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'user_id' | 'is_active'> {}
class User extends Model<UserAttributes, UserCreationAttributes> {
  public user_id!: number; 
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
  public readonly myDayPosts?: MyDayPost[];
  public readonly someoneDayPosts?: SomeoneDayPost[];
  public readonly challenges?: Challenge[];
  public readonly myDayComments?: MyDayComment[];
  public readonly someoneDayComments?: SomeoneDayComment[];
  public readonly myDayLikes?: MyDayLike[];
  public readonly someoneDayLikes?: SomeoneDayLike[];

  // 관계 선언
  public static associations: {
    emotionLogs: Association<User, EmotionLog>;
    myDayPosts: Association<User, MyDayPost>;
    someoneDayPosts: Association<User, SomeoneDayPost>;
    challenges: Association<User, Challenge>;
    myDayComments: Association<User, MyDayComment>;
    someoneDayComments: Association<User, SomeoneDayComment>;
    myDayLikes: Association<User, MyDayLike>;
    someoneDayLikes: Association<User, SomeoneDayLike>;
  };

  // 모델 초기화 메서드
  public static initialize(sequelize: Sequelize): typeof User {
    return User.init(
      {
        user_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
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
            isEmail: true,
            notEmpty: true
          }
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [6, 100]
          }
        },
        nickname: {
          type: DataTypes.STRING(50),
          allowNull: true,
          validate: {
            len: [2, 50]
          }
        },
        theme_preference: {
          type: DataTypes.ENUM('light', 'dark', 'system'),
          allowNull: true,
          defaultValue: 'system'
        },
        profile_image_url: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        last_login_at: {
          type: DataTypes.DATE,
          allowNull: true
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

  // 관계 설정 메서드 수정
  public static associate(models: any): void {
    // 감정 로그 관계
    User.hasMany(models.EmotionLog, {
      foreignKey: 'user_id',  // 단순화
      as: 'emotionLogs',
      onDelete: 'CASCADE'
    });

    // MyDay 게시물 관계
    User.hasMany(models.MyDayPost, {
      foreignKey: 'user_id',  // 단순화
      as: 'myDayPosts',
      onDelete: 'CASCADE'
    });

    // SomeoneDay 게시물 관계
    User.hasMany(models.SomeoneDayPost, {
      foreignKey: 'user_id',  // 단순화
      as: 'someoneDayPosts',
      onDelete: 'CASCADE'
    });

    // 챌린지 참여 관계
    User.belongsToMany(models.Challenge, {
      through: 'challenge_participants',
      foreignKey: 'user_id',  // 이미 단순한 형태
      otherKey: 'challenge_id',
      as: 'challenges'
    });

    // MyDay 댓글 관계
    User.hasMany(models.MyDayComment, {
      foreignKey: 'user_id',  // 단순화
      as: 'myDayComments',
      onDelete: 'CASCADE'
    });

    // SomeoneDay 댓글 관계
    User.hasMany(models.SomeoneDayComment, {
      foreignKey: 'user_id',  // 단순화
      as: 'someoneDayComments',
      onDelete: 'CASCADE'
    });

    // MyDay 좋아요 관계
    User.hasMany(models.MyDayLike, {
      foreignKey: 'user_id',  // 단순화
      as: 'myDayLikes',
      onDelete: 'CASCADE'
    });

    // SomeoneDay 좋아요 관계
    User.hasMany(models.SomeoneDayLike, {
      foreignKey: 'user_id',  // 단순화
      as: 'someoneDayLikes',
      onDelete: 'CASCADE'
    });
}


 // 인스턴스 메서드
 public toJSON(): Omit<UserAttributes, 'password'> {
  const values = this.get() as UserAttributes;
  const { password, ...rest } = values;
  return rest;
}

// 프로필 업데이트 메서드
public async updateProfile(data: Partial<UserAttributes>): Promise<void> {
  const updateData: Partial<UserAttributes> = {};
  
  if ('nickname' in data) updateData.nickname = data.nickname;
  if ('theme_preference' in data) updateData.theme_preference = data.theme_preference;
  if ('profile_image_url' in data) updateData.profile_image_url = data.profile_image_url;

  await this.update(updateData);
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
}
  
  // export class User를 제거하고 아래와 같이 export
export { User };
export type { UserAttributes, UserCreationAttributes };

// 기본 내보내기
export default User;