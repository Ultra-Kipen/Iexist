import { 
  Model, 
  DataTypes, 
  Sequelize, 
  InferAttributes, 
  InferCreationAttributes,
  CreationOptional,
  ForeignKey 
} from 'sequelize';

class Notification extends Model<
  InferAttributes<Notification>,
  InferCreationAttributes<Notification>
> {
  declare id: CreationOptional<number>;
  declare user_id: ForeignKey<number>;
  declare content: string;
  declare notification_type: 'like' | 'comment' | 'challenge' | 'system';
  declare related_id: CreationOptional<number>;
  declare is_read: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof Notification {
    Notification.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
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
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: true,
        updatedAt: false,
        underscored: true,
        indexes: [
          {
            fields: ['user_id', 'is_read']
          },
          {
            fields: ['created_at']
          }
        ]
      }
    );

    return Notification;
  }

  static associate(models: any): void {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

export default Notification;