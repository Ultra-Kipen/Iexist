import { Model, DataTypes, Sequelize } from 'sequelize';

class Tag extends Model {
  public id!: number;
  public name!: string;

  public static initialize(sequelize: Sequelize) {
    const model = Tag.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
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
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      }
    );

    return model;
  }

  public static associate(models: any) {
    const { SomeoneDayPost } = models;

    if (SomeoneDayPost) {
      Tag.belongsToMany(SomeoneDayPost, {
        through: 'post_tags',
        foreignKey: 'tag_id',
        otherKey: 'post_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
}

export default Tag;