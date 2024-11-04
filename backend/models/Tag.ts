import { Model, DataTypes, Sequelize } from 'sequelize';
import SomeoneDayPost from '../models/SomeoneDayPost';
interface TagAttributes {
tag_id: number;
name: string;
}
class Tag extends Model<TagAttributes> {
public tag_id!: number;
public name!: string;
public static initialize(sequelize: Sequelize) {
const model = Tag.init(
{
tag_id: {
type: DataTypes.INTEGER,
autoIncrement: true,
primaryKey: true
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
return model;
}
public static associate(models: {
SomeoneDayPost: typeof SomeoneDayPost;
}): void {
Tag.belongsToMany(models.SomeoneDayPost, {
through: 'someone_day_tags',
foreignKey: 'tag_id',
otherKey: 'post_id',
as: 'posts'
});
}
}
export default Tag;