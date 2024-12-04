import { Model, DataTypes, Sequelize } from 'sequelize';

interface UserBlockAttributes {
  user_id: number;
  blocked_user_id: number;
}

class UserBlock extends Model<UserBlockAttributes> {
  public static initialize(sequelize: Sequelize) {
    const model = UserBlock.init(
      {
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        },
        blocked_user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id'
          }
        }
      },
      {
        sequelize,
        modelName: 'UserBlock',
        tableName: 'user_blocks',
        timestamps: true,
        underscored: true
      }
    );
    return model;
  }

  public static associate(models: any) {
    UserBlock.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    UserBlock.belongsTo(models.User, {
      foreignKey: 'blocked_user_id',
      as: 'blocked_user'
    });
  }
}

export default UserBlock;