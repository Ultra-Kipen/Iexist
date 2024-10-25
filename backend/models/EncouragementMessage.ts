// backend/models/EncouragementMessage.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class EncouragementMessage extends Model {
  public id!: number;
  public sender_id!: number;
  public receiver_id!: number;
  public post_id!: number;
  public message!: string;
  public is_anonymous!: boolean;
  public readonly created_at!: Date;

  static initModel(sequelize: Sequelize) {
    return EncouragementMessage.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'someone_day_posts',
          key: 'id'
        }
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      is_anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      sequelize,
      tableName: 'encouragement_messages',
      modelName: 'EncouragementMessage',
      timestamps: true,
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          fields: ['receiver_id']
        },
        {
          fields: ['post_id']
        }
      ]
    });
  }

  static associate(models: any) {
    EncouragementMessage.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });

    EncouragementMessage.belongsTo(models.User, {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });

    EncouragementMessage.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });
  }
}

export default EncouragementMessage;