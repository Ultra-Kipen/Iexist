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
  declare id: CreationOptional<number>;
  declare user_id: ForeignKey<number>;
  declare my_day_post_count: number;
  declare someone_day_post_count: number;
  declare my_day_like_received_count: number;
  declare someone_day_like_received_count: number;
  declare my_day_comment_received_count: number;
  declare someone_day_comment_received_count: number;
  declare challenge_count: number;
  declare last_updated: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof UserStats {
    UserStats.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'users',
            key: 'id'
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
        timestamps: false,
        underscored: true
      }
    );

    return UserStats;
  }

  static associate(models: any): void {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

export default UserStats;