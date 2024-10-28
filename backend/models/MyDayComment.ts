import { Model, DataTypes, Sequelize } from 'sequelize';

class MyDayComment extends Model {
  public comment_id!: number;  // id 대신 comment_id 사용
  public post_id!: number;
  public user_id!: number;
  public content!: string;
  public is_anonymous!: boolean;
  public readonly created_at!: Date;

  public static initialize(sequelize: Sequelize) {
    return MyDayComment.init(
      {
        comment_id: {  // 기본키 필드명을 DB와 일치시킴
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          field: 'comment_id'
        },
        post_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'my_day_posts',
            key: 'post_id'
          }
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
          type: DataTypes.STRING(500),
          allowNull: false
        },
        is_anonymous: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
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
        modelName: 'MyDayComment',
        tableName: 'my_day_comments',
        timestamps: false,  // created_at만 사용하므로 false로 설정
        underscored: true,
        indexes: [
          {
            fields: ['post_id']
          },
          {
            fields: ['user_id']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    const { User, MyDayPost } = models;

    if (User) {
      MyDayComment.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }

    if (MyDayPost) {
      MyDayComment.belongsTo(MyDayPost, {
        foreignKey: 'post_id',
        as: 'post',
        onDelete: 'CASCADE'
      });
    }
  }
}

export default MyDayComment;