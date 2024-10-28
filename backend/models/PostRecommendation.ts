import { Model, DataTypes, Sequelize } from 'sequelize';

class PostRecommendation extends Model {
  public recommendation_id!: number;
  public post_id!: number;
  public recommended_post_id!: number;
  public post_type!: string;
  public reason?: string;

  public static initialize(sequelize: Sequelize) {
    return PostRecommendation.init(
      {
        recommendation_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        recommended_post_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        post_type: {
          type: DataTypes.ENUM('my_day', 'someone_day'),
          allowNull: false
        },
        reason: {
          type: DataTypes.STRING(100),
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: 'PostRecommendation',
        tableName: 'post_recommendations',
        timestamps: false
      }
    );
  }
}

export default PostRecommendation;