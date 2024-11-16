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
import { User } from '../models/User';
import SomeoneDayPost from '../models/SomeoneDayPost';

class EncouragementMessage extends Model<
  InferAttributes<EncouragementMessage>,
  InferCreationAttributes<EncouragementMessage>
> {
  declare message_id: CreationOptional<number>;
  declare sender_id: ForeignKey<number>;
  declare receiver_id: ForeignKey<number>;
  declare post_id: ForeignKey<number>;
  declare message: string;
  declare is_anonymous: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;

  declare sender?: NonAttribute<User>;
  declare receiver?: NonAttribute<User>;
  declare post?: NonAttribute<SomeoneDayPost>;

// models/EncouragementMessage.ts

public static initialize(sequelize: Sequelize) {
  const model = EncouragementMessage.init(
    {
      message_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
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
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
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
        },
        {
          fields: ['created_at']
        }
      ]
    }
  );
 
  return model; // Return the initialized model
 }

  public static associate(models: {
    User: typeof User;
    SomeoneDayPost: typeof SomeoneDayPost;
  }): void {
    this.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });
  
    this.belongsTo(models.User, {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });
  
    this.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });
  }

  toJSON() {
    const values = super.toJSON();
    if (values && (values as any).is_anonymous) {
      const { sender_id, sender, ...rest } = values as any;
      return rest;
    }
    return values;
  }
}

export { EncouragementMessage };
export default EncouragementMessage;