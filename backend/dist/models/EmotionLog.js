"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class EmotionLog extends sequelize_1.Model {
    static initModel(sequelize) {
        EmotionLog.init({
            log_id: {
                type: sequelize_1.DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'user_id'
                }
            },
            emotion_id: {
                type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'emotions',
                    key: 'emotion_id'
                }
            },
            log_date: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            note: sequelize_1.DataTypes.STRING(200)
        }, {
            sequelize,
            modelName: 'EmotionLog',
            tableName: 'emotion_logs',
            timestamps: false,
            underscored: true,
            indexes: [
                {
                    fields: ['user_id', 'log_date']
                }
            ]
        });
        return EmotionLog;
    }
    static associate(models) {
        if (models.User) {
            EmotionLog.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
        if (models.Emotion) {
            EmotionLog.belongsTo(models.Emotion, {
                foreignKey: 'emotion_id',
                as: 'emotion'
            });
        }
    }
}
exports.default = (sequelize) => {
    return EmotionLog.initModel(sequelize);
};
