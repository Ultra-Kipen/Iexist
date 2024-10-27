"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    static initModel(sequelize) {
        User.init({
            user_id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '사용자 고유 ID'
            },
            username: {
                type: sequelize_1.DataTypes.STRING(50),
                unique: true,
                allowNull: false,
                validate: {
                    len: [4, 20],
                    notEmpty: true,
                    isAlphanumeric: true
                },
                comment: '사용자 계정명'
            },
            email: {
                type: sequelize_1.DataTypes.STRING(100),
                unique: true,
                allowNull: false,
                validate: {
                    isEmail: true,
                    notEmpty: true
                },
                comment: '사용자 이메일'
            },
            password_hash: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [60, 60] // bcrypt hash length
                },
                comment: '비밀번호 해시'
            },
            nickname: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                validate: {
                    len: [2, 20]
                },
                comment: '사용자 닉네임'
            },
            profile_image_url: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isUrl: true
                },
                comment: '프로필 이미지 URL'
            },
            background_image_url: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isUrl: true
                },
                comment: '배경 이미지 URL'
            },
            favorite_quote: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                comment: '좋아하는 문구'
            },
            theme_preference: {
                type: sequelize_1.DataTypes.ENUM('light', 'dark', 'system'),
                defaultValue: 'system',
                allowNull: false,
                comment: '테마 설정'
            },
            privacy_settings: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false,
                defaultValue: {
                    profile_visibility: 'public',
                    post_visibility: 'public',
                    emotion_visibility: 'public'
                },
                validate: {
                    isValidPrivacySettings(value) {
                        const validValues = ['public', 'private', 'friends'];
                        const requiredKeys = ['profile_visibility', 'post_visibility', 'emotion_visibility'];
                        if (typeof value !== 'object') {
                            throw new Error('개인정보 설정은 객체여야 합니다.');
                        }
                        for (const key of requiredKeys) {
                            if (!value[key]) {
                                throw new Error(`${key}는 필수 설정입니다.`);
                            }
                            if (!validValues.includes(value[key])) {
                                throw new Error(`${key}의 값이 올바르지 않습니다.`);
                            }
                        }
                    }
                },
                comment: '개인정보 설정'
            },
            last_login_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '마지막 로그인 시간'
            },
            is_deleted: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
                comment: '계정 삭제 여부'
            },
            deleted_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '계정 삭제 시간'
            },
            reset_token: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                comment: '비밀번호 재설정 토큰'
            },
            reset_token_expiry: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '비밀번호 재설정 토큰 만료시간'
            },
            created_at: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
                comment: '생성 시간'
            },
            updated_at: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
                onUpdate: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
                comment: '수정 시간'
            }
        }, {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['email']
                },
                {
                    unique: true,
                    fields: ['username']
                },
                {
                    fields: ['is_deleted']
                }
            ],
            hooks: {
                beforeFind: (options) => {
                    var _a;
                    // Exclude deleted users by default unless specifically requested
                    if (!options.paranoid && !((_a = options.where) === null || _a === void 0 ? void 0 : _a.is_deleted)) {
                        options.where = Object.assign(Object.assign({}, options.where), { is_deleted: false });
                    }
                }
            }
        });
        return User;
    }
    static associate(models) {
        User.hasMany(models.MyDayPost, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        User.hasMany(models.EmotionLog, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        User.hasMany(models.Challenge, {
            foreignKey: 'creator_id',
            onDelete: 'CASCADE'
        });
        User.hasMany(models.SomeoneDayPost, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        User.hasMany(models.MyDayComment, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        User.hasMany(models.MyDayLike, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        User.hasMany(models.ChallengeParticipant, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        User.hasOne(models.UserStats, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        User.hasMany(models.Notification, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
    }
}
exports.default = (sequelize) => {
    return User.initModel(sequelize);
};
