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

  public static initialize(sequelize: Sequelize) {
    const model = SomeoneDayPost.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        user_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
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
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      }
    );

    return model;
  }

  public static associate(models: any) {
    const { User, Tag } = models;

    if (User) {
      SomeoneDayPost.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }

    if (Tag) {
      SomeoneDayPost.belongsToMany(Tag, {
        through: 'post_tags',
        foreignKey: 'post_id',
        otherKey: 'tag_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
}

export default SomeoneDayPost;