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

  static init(sequelize: Sequelize): void {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
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

  static associate(models: any): void {
    // User와의 관계
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Comment와의 관계
    this.hasMany(models.MyDayComment, {
      foreignKey: 'post_id',
      as: 'comments'
    });

    // Like와의 관계
    this.hasMany(models.MyDayLike, {
      foreignKey: 'post_id',
      as: 'likes'
    });

    // Emotion과의 다대다 관계
    this.belongsToMany(models.Emotion, {
      through: 'my_day_emotions',
      foreignKey: 'post_id',
      otherKey: 'emotion_id',
      as: 'emotions'
    });
  }
}

export default MyDayPost;
