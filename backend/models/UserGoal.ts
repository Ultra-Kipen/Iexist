import { Model, DataTypes, Sequelize } from 'sequelize';

class UserGoal extends Model {
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
            key: 'user_id'  // id -> user_id로 변경
          }
        },
        target_emotion_id: {
          type: DataTypes.INTEGER,  // SQLite에서는 UNSIGNED 지원하지 않음
          allowNull: false,
          references: {
            model: 'emotions',
            key: 'emotion_id'  // id -> emotion_id로 변경
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
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        sequelize,
        modelName: 'UserGoal',
        tableName: 'user_goals',
        timestamps: true,
        underscored: true
      }
    );
  }
  public static associate(models: any) {
    UserGoal.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'user_id',  // targetKey 추가
      as: 'user'
    });

    UserGoal.belongsTo(models.Emotion, {
      foreignKey: 'target_emotion_id',
      targetKey: 'emotion_id',  // targetKey 추가
      as: 'targetEmotion'
    });
  }
}

export default UserGoal;