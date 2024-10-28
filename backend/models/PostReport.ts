import { Model, DataTypes, Sequelize } from 'sequelize';

class PostReport extends Model {
  public report_id!: number;
  public post_id!: number;
  public reporter_id!: number;
  public report_type!: string;
  public description?: string;
  public status!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    return PostReport.init(
      {
        report_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          field: 'report_id'
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
        reporter_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        },
        report_type: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
          allowNull: false,
          defaultValue: 'pending'
        }
      },
      {
        sequelize,
        modelName: 'PostReport',
        tableName: 'post_reports',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['post_id']
          },
          {
            fields: ['reporter_id']
          },
          {
            fields: ['status']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    PostReport.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id',
      as: 'post',
      onDelete: 'CASCADE'
    });

    PostReport.belongsTo(models.User, {
      foreignKey: 'reporter_id',
      as: 'reporter'
    });
  }
}

export default PostReport;