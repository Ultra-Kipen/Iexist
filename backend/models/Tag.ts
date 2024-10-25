// backend/models/Tag.ts

import { Model, DataTypes, Sequelize } from 'sequelize';

interface TagAttributes {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface TagInstance extends Model<TagAttributes>, TagAttributes {}

export class Tag extends Model<TagAttributes> {
  declare id: number;
  declare name: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  public static initialize(sequelize: Sequelize) {
    Tag.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        tableName: 'tags',
        modelName: 'Tag',
        timestamps: true,
        underscored: true
      }
    );
  }

  public static associate(models: any) {
    Tag.belongsToMany(models.SomeoneDayPost, {
      through: 'post_tags',
      foreignKey: 'tag_id',
      otherKey: 'post_id',
      as: 'posts'
    });
  }
}

export default Tag;