import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey
  } from 'sequelize';
  import { User } from '../models/User';
  interface NotificationAttributes {
  id: number;
  user_id: number;
  content: string;
  notification_type: 'like' | 'comment' | 'challenge' | 'system';
  related_id?: number;
  is_read: boolean;
  }
  class Notification extends Model<
    InferAttributes<Notification>,
    InferCreationAttributes<Notification>
  >
  
  {
  declare id: CreationOptional<number>;
  declare user_id: ForeignKey<number>;
  declare content: string;
  declare notification_type: 'like' | 'comment' | 'challenge' | 'system';
  declare related_id: CreationOptional<number>;
  declare is_read: CreationOptional<boolean>;
  declare readonly created_at: CreationOptional<Date>;
  
  public static initialize(sequelize: Sequelize) {
  const model = Notification.init(
  {
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
  key: 'user_id'
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
  return model;
  }
  public static associate(models: {
  User: typeof User;
  }): void {
  Notification.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user'
  });
  }
  }
  export default Notification;