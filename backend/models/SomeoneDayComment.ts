// backend/models/SomeoneDayComment.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class SomeoneDayComment extends Model {
  public id!: number;
  public post_id!: number;
  public user_id!: number;
  public content!: string;
  public is_anonymous!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    return this.init(
      {
        id: {
          type: DataTypes.INTEGER,  // UNSIGNED 제거
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        post_id: {
          type: DataTypes.INTEGER,  // UNSIGNED 제거
          allowNull: false,
          references: {
            model: 'someone_day_posts',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        user_id: {
          type: DataTypes.INTEGER,  // UNSIGNED 제거
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        content: {
          type: DataTypes.STRING(500),
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [1, 500]
          }
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
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

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    this.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id',
      as: 'post',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
}

export default SomeoneDayComment;