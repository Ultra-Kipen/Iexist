"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class SomeoneDayPost extends sequelize_1.Model {
    static initModel(sequelize) {
        SomeoneDayPost.init({
            post_id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            title: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false
            },
            content: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
            },
            summary: sequelize_1.DataTypes.STRING(200),
            image_url: sequelize_1.DataTypes.STRING(255),
            is_anonymous: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            },
            character_count: sequelize_1.DataTypes.SMALLINT.UNSIGNED,
            like_count: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            comment_count: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            created_at: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW
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
    static associate(models) {
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
exports.default = (sequelize) => {
    return SomeoneDayPost.initModel(sequelize);
};
