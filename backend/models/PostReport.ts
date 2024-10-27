// backend/models/PostReport.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database'; // DB 연결 인스턴스
import User from './User'; // 외래 키로 참조할 User 모델

class PostReport extends Model {
  public id!: number;
  public userId!: number;
  public postId!: number;
  public reason!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initialize(sequelize: Sequelize): void {
    PostReport.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: User,
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        postId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        reason: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'PostReport',
        tableName: 'post_reports',
        timestamps: true,
      }
    );
  }

  static associate(models: any): void {
    PostReport.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

export default PostReport;
