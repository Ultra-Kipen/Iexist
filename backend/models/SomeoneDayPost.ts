import { Model, DataTypes, Sequelize } from 'sequelize';

class SomeoneDayPost extends Model {
  public post_id!: number;
  public user_id!: number;
  public title!: string;
  public content!: string;
  public summary?: string;
  public image_url?: string;
  public is_anonymous!: boolean;
  public character_count?: number;
  public like_count!: number;
  public comment_count!: number;

  public static initialize(sequelize: Sequelize) {
    return SomeoneDayPost.init(
      {
        post_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          field: 'post_id'
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        summary: {
          type: DataTypes.STRING(200),
          allowNull: true
        },
        image_url: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        character_count: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true
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

  public static associate(models: any) {
    const { User, Tag } = models;

    SomeoneDayPost.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    if (Tag) {
      SomeoneDayPost.belongsToMany(Tag, {
        through: 'someone_day_tags',
        foreignKey: 'post_id',
        otherKey: 'tag_id',
        as: 'tags'
      });
    }
  }
}

export default SomeoneDayPost;