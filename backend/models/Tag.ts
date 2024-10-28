import { Model, DataTypes, Sequelize } from 'sequelize';

class Tag extends Model {
  public tag_id!: number;  // id를 tag_id로 변경
  public name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    return Tag.init(
      {
        tag_id: {  // 기본키 필드명 변경
          type: DataTypes.SMALLINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          field: 'tag_id'  // 실제 DB 컬럼명 지정
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true
        }
      },
      {
        sequelize,
        modelName: 'Tag',
        tableName: 'tags',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['name']
          }
        ]
      }
    );
  }

  public static associate(models: any) {
    const { SomeoneDayPost } = models;

    if (SomeoneDayPost) {
      Tag.belongsToMany(SomeoneDayPost, {
        through: 'post_tags',
        foreignKey: 'tag_id',
        otherKey: 'post_id',
        as: 'posts'
      });
    }
  }
}

export default Tag;