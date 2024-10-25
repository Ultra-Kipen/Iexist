"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Challenge extends sequelize_1.Model {
    static initModel(sequelize) {
        Challenge.init({
            challenge_id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            creator_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            title: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false
            },
            description: sequelize_1.DataTypes.TEXT,
            start_date: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            end_date: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            is_public: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true
            },
            max_participants: sequelize_1.DataTypes.SMALLINT.UNSIGNED,
            participant_count: {
                type: sequelize_1.DataTypes.SMALLINT.UNSIGNED,
                defaultValue: 0
            },
            created_at: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW
            }
        }, {
            sequelize,
            modelName: 'Challenge',
            tableName: 'challenges',
            timestamps: true,
            underscored: true
        });
        return Challenge;
    }
    static associate(models) {
        Challenge.belongsTo(models.User, {
            as: 'Creator',
            foreignKey: 'creator_id'
        });
        // ChallengeParticipant와 ChallengeEmotion 모델이 정의된 후에만 관계 설정
        if (models.ChallengeParticipant) {
            Challenge.hasMany(models.ChallengeParticipant, {
                foreignKey: 'challenge_id',
                as: 'Participants'
            });
        }
        if (models.ChallengeEmotion) {
            Challenge.hasMany(models.ChallengeEmotion, {
                foreignKey: 'challenge_id',
                as: 'Emotions'
            });
        }
    }
}
exports.default = (sequelize) => {
    return Challenge.initModel(sequelize);
};
