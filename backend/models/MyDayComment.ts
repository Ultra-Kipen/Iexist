import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayComment extends Model {
  public id!: number;
  public post_id!: number;
  public user_id!: number;
  public content!: string;
  public is_anonymous!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    const model = MyDayComment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'my_day_posts',
            key: 'id'
          }
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
          type: DataTypes.STRING(500),
          allowNull: false,
          validate: {
            len: [1, 500]
          }
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      },
      {
        sequelize,
        modelName: 'MyDayComment',
        tableName: 'my_day_comments',
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

    return model;
  }

  public static associate(models: any) {
    const { User, MyDayPost } = models;

    if (User && MyDayPost) {
      // User와의 관계
      MyDayComment.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // MyDayPost와의 관계
      MyDayComment.belongsTo(MyDayPost, {
        foreignKey: 'post_id',
        as: 'post',
        onDelete: 'CASCADE'
      });
    }
  }
}

export default MyDayComment;