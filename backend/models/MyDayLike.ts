import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayLike extends Model {
  public user_id!: number;
  public post_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    return MyDayLike.init(
      {
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        },
        post_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'my_day_posts',
            key: 'post_id'
          }
        }
      },
      {
        sequelize,
        modelName: 'MyDayLike',
        tableName: 'my_day_likes',
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
    MyDayLike.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    MyDayLike.belongsTo(models.MyDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });
  }
}

export default MyDayLike;