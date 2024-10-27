"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Emotion extends sequelize_1.Model {
    static initModel(sequelize) {
        Emotion.init({
            emotion_id: {
                type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            icon: {
                type: sequelize_1.DataTypes.STRING(10),
                allowNull: false
            }
        }, {
            sequelize,
            modelName: 'Emotion',
            tableName: 'emotions',
            timestamps: false,
            underscored: true
        });
        return Emotion;
    }
    static associate(models) {
        Emotion.belongsToMany(models.MyDayPost, {
            through: 'my_day_emotions',
            foreignKey: 'emotion_id'
        });
        Emotion.hasMany(models.EmotionLog, {
            foreignKey: 'emotion_id'
        });
    }
}
exports.default = (sequelize) => {
    return Emotion.initModel(sequelize);
};
