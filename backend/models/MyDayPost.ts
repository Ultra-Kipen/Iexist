import { Model, DataTypes, Sequelize } from 'sequelize';

interface MyDayPostAttributes {
  post_id: number;
  user_id: number;
  content: string;
  emotion_summary?: string;
  image_url?: string;
  is_anonymous: boolean;
  character_count?: number;
  like_count: number;
  comment_count: number;
  created_at: Date;
}

class MyDayPost extends Model<MyDayPostAttributes> implements MyDayPostAttributes {
  public post_id!: number;
  public user_id!: number;
  public content!: string;
  public emotion_summary!: string | undefined;
  public image_url!: string | undefined;
  public is_anonymous!: boolean;
  public character_count!: number | undefined;
  public like_count!: number;
  public comment_count!: number;
  public created_at!: Date;

  static initModel(sequelize: Sequelize): typeof MyDayPost {
    MyDayPost.init({
      post_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      emotion_summary: DataTypes.STRING(100),
      image_url: DataTypes.STRING(255),
      is_anonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      character_count: DataTypes.SMALLINT.UNSIGNED,
      like_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      comment_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'MyDayPost',
      tableName: 'my_day_posts',
      timestamps: true,
      underscored: true
    });

    return MyDayPost;
  }

  static associate(models: any): void {
    MyDayPost.belongsTo(models.User, {
      foreignKey: 'user_id'
    });
    MyDayPost.belongsToMany(models.Emotion, {
      through: 'my_day_emotions',
      foreignKey: 'post_id'
    });
    if (models.MyDayComment) {
      MyDayPost.hasMany(models.MyDayComment, {
        foreignKey: 'post_id'
      });
    }
    if (models.MyDayLike) {
      MyDayPost.hasMany(models.MyDayLike, {
        foreignKey: 'post_id'
      });
    }
  }
}

export default (sequelize: Sequelize): typeof MyDayPost => {
  return MyDayPost.initModel(sequelize);
};