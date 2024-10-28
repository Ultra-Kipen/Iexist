import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayEmotion extends Model {
  public post_id!: number;
  public emotion_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    return MyDayEmotion.init(
      {
        post_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'my_day_posts',
            key: 'post_id'
          },
          onDelete: 'CASCADE'
        },
        emotion_id: {
          type: DataTypes.TINYINT.UNSIGNED,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'emotions',
            key: 'emotion_id'
          },
          onDelete: 'CASCADE'
        }
      },
      {
        sequelize,
        modelName: 'MyDayEmotion',
        tableName: 'my_day_emotions',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['post_id']
          },
          {
            fields: ['emotion_id']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    // MyDayPost와의 관계
    MyDayEmotion.belongsTo(models.MyDayPost, {
      foreignKey: 'post_id',
      as: 'post'
    });

    // Emotion과의 관계
    MyDayEmotion.belongsTo(models.Emotion, {
      foreignKey: 'emotion_id',
      as: 'emotion'
    });
  }
}

export default MyDayEmotion;