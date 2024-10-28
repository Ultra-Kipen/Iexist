import { Model, DataTypes, Sequelize } from 'sequelize';

class SomeoneDayComment extends Model {
  public comment_id!: number;
  public post_id!: number;
  public user_id!: number;
  public content!: string;
  public is_anonymous!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    return SomeoneDayComment.init(
      {
        comment_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          field: 'comment_id'
        },
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'someone_day_posts',
            key: 'post_id'
          },
          onDelete: 'CASCADE'
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        },
        content: {
          type: DataTypes.STRING(500),
          allowNull: false
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      },
      {
        sequelize,
        modelName: 'SomeoneDayComment',
        tableName: 'someone_day_comments',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['post_id']
          },
          {
            fields: ['user_id']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    SomeoneDayComment.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id',
      as: 'post',
      onDelete: 'CASCADE'
    });

    SomeoneDayComment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

export default SomeoneDayComment;