import { Model, DataTypes, Sequelize } from 'sequelize';

class PostTag extends Model {
  public post_id!: number;
  public tag_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    const model = PostTag.init(
      {
        post_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'someone_day_posts',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        tag_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'tags',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      {
        sequelize,
        modelName: 'PostTag',
        tableName: 'post_tags',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['post_id']
          },
          {
            fields: ['tag_id']
          }
        ]
      }
    );

    return model;
  }
}

export default PostTag;