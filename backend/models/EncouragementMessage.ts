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

  static init(sequelize: Sequelize): void {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
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
          allowNull: false,
          validate: {
            len: [1, 1000]
          }
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        }
      },
      {
        sequelize,
        modelName: 'EncouragementMessage',
        tableName: 'encouragement_messages',
        timestamps: true,
        updatedAt: false,
        underscored: true,
        indexes: [
          {
            fields: ['sender_id']
          },
          {
            fields: ['receiver_id']
          },
          {
            fields: ['post_id']
          }
        ]
      }
    );
  }

  static associate(models: any): void {
    // Sender와의 관계
    this.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });

    // Receiver와의 관계
    this.belongsTo(models.User, {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });

    // SomeoneDayPost와의 관계
    this.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });
  }
}

export default EncouragementMessage;
