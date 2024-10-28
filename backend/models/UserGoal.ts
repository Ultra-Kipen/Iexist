import { Model, DataTypes, Sequelize } from 'sequelize';

class UserGoal extends Model {
  public goal_id!: number;
  public user_id!: number;
  public target_emotion_id!: number;
  public start_date!: Date;
  public end_date!: Date;
  public progress!: number;

  public static initialize(sequelize: Sequelize) {
    return UserGoal.init(
      {
        goal_id: {
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
        target_emotion_id: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: false,
          references: {
            model: 'emotions',
            key: 'emotion_id'
          }
        },
        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        end_date: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        progress: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        sequelize,
        modelName: 'UserGoal',
        tableName: 'user_goals',
        timestamps: false
      }
    );
  }

  public static associate(models: any) {
    UserGoal.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    UserGoal.belongsTo(models.Emotion, {
      foreignKey: 'target_emotion_id',
      as: 'targetEmotion'
    });
  }
}

export default UserGoal;