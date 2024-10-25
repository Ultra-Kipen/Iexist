// backend/models/PostReport.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class PostReport extends Model {
  public id!: number;
  public post_type!: 'my_day' | 'someone_day';
  public post_id!: number;
  public reporter_id!: number;
  public reason!: string;
  public status!: 'pending' | 'reviewed' | 'resolved';
  public admin_note?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initModel(sequelize: Sequelize) {
    return PostReport.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      post_type: {
        type: DataTypes.ENUM('my_day', 'someone_day'),
        allowNull: false
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      reporter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      reason: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'resolved'),
        allowNull: false,
        defaultValue: 'pending'
      },
      admin_note: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    }, {
      sequelize,
      tableName: 'post_reports',
      modelName: 'PostReport',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['post_type', 'post_id']
        },
        {
          fields: ['status']
        }
      ]
    });
  }

  static associate(models: any) {
    PostReport.belongsTo(models.User, {
      foreignKey: 'reporter_id',
      as: 'reporter'
    });
  }
}

export default PostReport;