"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class MyDayPost extends sequelize_1.Model {
    static initModel(sequelize) {
        MyDayPost.init({
            post_id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            content: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
            },
            emotion_summary: sequelize_1.DataTypes.STRING(100),
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
            modelName: 'MyDayPost',
            tableName: 'my_day_posts',
            timestamps: true,
            underscored: true
        });
        return MyDayPost;
    }
    static associate(models) {
        MyDayPost.belongsTo(models.User, {
            foreignKey: 'user_id'
        });
        MyDayPost.belongsToMany(models.Emotion, {
            through: 'my_day_emotions',
            foreignKey: 'post_id'
        });
        if (models.MyDayComment) {
            MyDayPost.hasMany(models.MyDayComment, {
                foreignKey: 'post_id'
            });
        }
        if (models.MyDayLike) {
            MyDayPost.hasMany(models.MyDayLike, {
                foreignKey: 'post_id'
            });
        }
    }
}
exports.default = (sequelize) => {
    return MyDayPost.initModel(sequelize);
};
