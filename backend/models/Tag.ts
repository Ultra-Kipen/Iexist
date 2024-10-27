// backend/models/Tag.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

class Tag extends Model {
  public id!: number;
  public name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    return this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
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
            unique: true,
            fields: ['name']
          }
        ]
      }
    );
  }

  static associate(models: any) {
    if (!models.SomeoneDayPost) {
      console.warn('SomeoneDayPost model is not initialized');
      return;
    }

    // SomeoneDayPost와의 다대다 관계
    this.belongsToMany(models.SomeoneDayPost, {
      through: 'post_tags',
      as: 'posts',
      foreignKey: {
        name: 'tag_id',
        allowNull: false
      },
      otherKey: {
        name: 'post_id',
        allowNull: false
      }
    });
  }
}

export default Tag;