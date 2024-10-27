// backend/models/SomeoneDayLike.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class SomeoneDayLike extends Model {
  public id!: number;
  public user_id!: number;
  public post_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    return this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          references: {
            model: 'someone_day_posts',
            key: 'id'
          }
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
        modelName: 'SomeoneDayLike',
        tableName: 'someone_day_likes',
        timestamps: true,
        underscored: true
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

export default SomeoneDayLike;