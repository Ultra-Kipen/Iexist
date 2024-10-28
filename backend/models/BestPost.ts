import { Model, DataTypes, Sequelize } from 'sequelize';

class BestPost extends Model {
  public best_post_id!: number;
  public post_id!: number;
  public post_type!: string;
  public category!: string;
  public start_date!: Date;
  public end_date!: Date;

  public static initialize(sequelize: Sequelize) {
    return BestPost.init(
      {
        best_post_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        post_type: {
          type: DataTypes.ENUM('my_day', 'someone_day'),
          allowNull: false
        },
        category: {
          type: DataTypes.ENUM('weekly', 'monthly'),
          allowNull: false
        },
        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        end_date: {
          type: DataTypes.DATEONLY,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: 'BestPost',
        tableName: 'best_posts',
        timestamps: false
      }
    );
  }
}

export default BestPost;