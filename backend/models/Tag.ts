// backend/models/Tag.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class Tag extends Model {
  public id!: number;
  public name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static init(sequelize: Sequelize): void {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            len: [1, 50]
          }
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
            fields: ['name']
          }
        ]
      }
    );
  }

  static associate(models: any): void {
    // SomeoneDayPost와의 다대다 관계
    this.belongsToMany(models.SomeoneDayPost, {
      through: 'post_tags',
      foreignKey: 'tag_id',
      otherKey: 'post_id',
      as: 'posts'
    });
  }
}

export default Tag;
