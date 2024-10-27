// backend/models/SomeoneDayPost.ts

import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database'; // 데이터베이스 연결 인스턴스
import User from './User'; // 외래 키 참조하는 User 모델

class SomeoneDayPost extends Model {
  public id!: number;
  public title!: string;
  public content!: string;
  public userId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initialize(sequelize: Sequelize): void {
    SomeoneDayPost.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
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
        sequelize, // 인스턴스를 직접 전달
        modelName: 'SomeoneDayPost',
        tableName: 'someone_day_posts',
        timestamps: true,
      }
    );
  }

  static associate(models: any): void {
    SomeoneDayPost.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

export default SomeoneDayPost;
