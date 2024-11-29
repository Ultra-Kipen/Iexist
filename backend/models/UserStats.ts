import { 
  Model, 
  DataTypes, 
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey
} from 'sequelize';

class UserStats extends Model<
  InferAttributes<UserStats>,
  InferCreationAttributes<UserStats>
> {
  public static initialize(sequelize: Sequelize) {  // initModel -> initialize
    const model = UserStats.init(
      {
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          unique: true,
          references: {
            model: 'users',
            key: 'user_id' // id -> user_id로 수정
          }
        },
        my_day_post_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        someone_day_post_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        my_day_like_received_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        someone_day_like_received_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        my_day_comment_received_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        someone_day_comment_received_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        challenge_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        last_updated: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'UserStats',
        tableName: 'user_stats',
        timestamps: true,
        underscored: true
      }
    );
    return model;
  }

  public static associate(models: {
    User: any;
  }): void {
    UserStats.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'user_id',
      as: 'user'
    });
  }
}

export default UserStats;