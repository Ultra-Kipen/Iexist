// backend/models/Notification.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class Notification extends Model {
  public id!: number;
  public user_id!: number;
  public content!: string;
  public notification_type!: 'like' | 'comment' | 'challenge' | 'system';
  public related_id?: number;
  public is_read!: boolean;
  public readonly created_at!: Date;

  static initModel(sequelize: Sequelize) {
    return Notification.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
        type: DataTypes.STRING(255),
        allowNull: false
      },
      notification_type: {
        type: DataTypes.ENUM('like', 'comment', 'challenge', 'system'),
        allowNull: false
      },
      related_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      sequelize,
      tableName: 'notifications',
      modelName: 'Notification',
      timestamps: true,
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          fields: ['user_id', 'is_read']
        }
      ]
    });
  }

  static associate(models: any) {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

export default Notification;