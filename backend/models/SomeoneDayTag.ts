import { Model, DataTypes, Sequelize } from 'sequelize';

export class SomeoneDayTag extends Model {
  public post_id!: number;
  public tag_id!: number;

  static initialize(sequelize: Sequelize) {
    SomeoneDayTag.init(
      {
        post_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'someone_day_posts',
            key: 'post_id'
          }
        },
        tag_id: {
          type: DataTypes.SMALLINT.UNSIGNED,
          primaryKey: true,
          references: {
            model: 'tags',
            key: 'tag_id'
          }
        }
      },
      {
        sequelize,
        tableName: 'someone_day_tags',
        timestamps: false
      }
    );
  }

  static associate(models: {
    SomeoneDayPost: any;
    Tag: any;
  }) {
    SomeoneDayTag.belongsTo(models.SomeoneDayPost, {
      foreignKey: 'post_id'
    });
    SomeoneDayTag.belongsTo(models.Tag, {
      foreignKey: 'tag_id'
    });
  }
}

export default SomeoneDayTag;