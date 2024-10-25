import { Model, DataTypes, Sequelize } from 'sequelize';

interface SomeoneDayPostAttributes {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  summary?: string;
  image_url?: string;
  is_anonymous: boolean;
  character_count?: number;
  like_count: number;
  comment_count: number;
  created_at: Date;
}

class SomeoneDayPost extends Model<SomeoneDayPostAttributes> implements SomeoneDayPostAttributes {
  public post_id!: number;
  public user_id!: number;
  public title!: string;
  public content!: string;
  public summary!: string | undefined;
  public image_url!: string | undefined;
  public is_anonymous!: boolean;
  public character_count!: number | undefined;
  public like_count!: number;
  public comment_count!: number;
  public created_at!: Date;

  static initModel(sequelize: Sequelize): typeof SomeoneDayPost {
    SomeoneDayPost.init({
      post_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      summary: DataTypes.STRING(200),
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
      modelName: 'SomeoneDayPost',
      tableName: 'someone_day_posts',
      timestamps: true,
      underscored: true
    });

    return SomeoneDayPost;
  }

  static associate(models: any): void {
    SomeoneDayPost.belongsTo(models.User, {
      foreignKey: 'user_id'
    });
    
    if (models.Tag) {
      SomeoneDayPost.belongsToMany(models.Tag, {
        through: 'someone_day_tags',
        foreignKey: 'post_id'
      });
    }
    
    if (models.EncouragementMessage) {
      SomeoneDayPost.hasMany(models.EncouragementMessage, {
        foreignKey: 'post_id'
      });
    }
    
    if (models.SomeoneDayLike) {
      SomeoneDayPost.hasMany(models.SomeoneDayLike, {
        foreignKey: 'post_id'
      });
    }
  }
}

export default (sequelize: Sequelize): typeof SomeoneDayPost => {
  return SomeoneDayPost.initModel(sequelize);
};