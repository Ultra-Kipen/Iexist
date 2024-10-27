// backend/models/MyDayPost.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayPost extends Model {
  public id!: number;
  public user_id!: number;
  public content!: string;
  public image_url?: string;
  public emotion_summary?: string;
  public is_anonymous!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    return this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [1, 1000]
          }
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        emotion_summary: {
          type: DataTypes.STRING(100),
          allowNull: true
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      },
      {
        sequelize,
        modelName: 'MyDayPost',
        tableName: 'my_day_posts',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['user_id']
          },
          {
            fields: ['created_at']
          }
        ]
      }
    );
  }

  static associate(models: any) {
    // User와의 관계
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // MyDayComment와의 관계
    this.hasMany(models.MyDayComment, {
      foreignKey: 'post_id',
      as: 'comments'
    });

    // MyDayLike와의 관계
    this.hasMany(models.MyDayLike, {
      foreignKey: 'post_id',
      as: 'likes'
    });

    // Emotion과의 다대다 관계
    this.belongsToMany(models.Emotion, {
      through: 'post_emotions',
      foreignKey: 'post_id',
      otherKey: 'emotion_id',
      as: 'emotions'
    });
  }

  // 인스턴스 메서드 예시
  toJSON() {
    const values = super.toJSON();
    if (this.is_anonymous) {
      delete values.user_id;
    }
    return values;
  }

  // 커스텀 메서드 예시
  async getLikesCount() {
    return await (this.constructor as typeof MyDayPost).count({
      where: {
        post_id: this.id
      }
    });
  }
}

export default MyDayPost;