// backend/models/SomeoneDayPost.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class SomeoneDayPost extends Model {
  public id!: number;
  public user_id!: number;
  public title!: string;
  public content!: string;
  public image_url?: string;
  public is_anonymous!: boolean;
  public like_count!: number;
  public comment_count!: number;
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
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            len: [1, 100]
          }
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            len: [1, 2000]
          }
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        like_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        comment_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        sequelize,
        modelName: 'SomeoneDayPost',
        tableName: 'someone_day_posts',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['user_id']
          },
          {
            fields: ['created_at']
          },
          {
            fields: ['like_count']
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

    // Tag와의 다대다 관계
    this.belongsToMany(models.Tag, {
      through: 'post_tags',
      foreignKey: 'post_id',
      otherKey: 'tag_id',
      as: 'tags'
    });

    // Comment와의 관계
    this.hasMany(models.SomeoneDayComment, {
      foreignKey: 'post_id',
      as: 'comments'
    });

    // Like와의 관계
    this.hasMany(models.SomeoneDayLike, {
      foreignKey: 'post_id',
      as: 'likes'
    });

    // EncouragementMessage와의 관계
    this.hasMany(models.EncouragementMessage, {
      foreignKey: 'post_id',
      as: 'encouragementMessages'
    });
  }
}

export default SomeoneDayPost;
