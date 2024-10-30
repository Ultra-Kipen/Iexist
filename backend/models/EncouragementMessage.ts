import { 
  Model, 
  DataTypes, 
  Sequelize, 
  InferAttributes, 
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute
} from 'sequelize';
import { User } from './User';
import SomeoneDayPost from '../models/SomeoneDayPost';

class EncouragementMessage extends Model<
  InferAttributes<EncouragementMessage>,
  InferCreationAttributes<EncouragementMessage>
> {
  declare id: CreationOptional<number>;
  declare sender_id: ForeignKey<User['id']>;
  declare receiver_id: ForeignKey<User['id']>;
  declare post_id: ForeignKey<SomeoneDayPost['post_id']>;
  declare message: string;
  declare is_anonymous: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;

  declare sender?: NonAttribute<User>;
  declare receiver?: NonAttribute<User>;
  declare post?: NonAttribute<SomeoneDayPost>;

  static associate(models: any) {
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

  static initModel(sequelize: Sequelize): typeof EncouragementMessage {
    EncouragementMessage.init(
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
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
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

    return EncouragementMessage;
  }
}

export default EncouragementMessage;