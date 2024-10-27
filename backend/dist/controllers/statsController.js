"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
const statsController = {
    getUserStats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const { start_date, end_date, type = 'daily' } = req.query;
            const whereClause = { user_id };
            if (start_date && end_date) {
                whereClause.last_updated = {
                    [sequelize_1.Op.between]: [new Date(start_date), new Date(end_date)]
                };
            }
            const stats = yield models_1.default.UserStats.findOne({
                where: whereClause,
                attributes: [
                    'user_id',
                    'my_day_post_count',
                    'someone_day_post_count',
                    'my_day_like_received_count',
                    'someone_day_like_received_count',
                    'my_day_comment_received_count',
                    'someone_day_comment_received_count',
                    'challenge_count',
                    'last_updated'
                ]
            });
            if (!stats) {
                return res.status(404).json({
                    status: 'error',
                    message: '통계 정보를 찾을 수 없습니다.'
                });
            }
            // 감정 통계 조회
            const emotionStats = yield models_1.default.EmotionLog.findAll({
                attributes: [
                    'emotion_id',
                    [models_1.default.sequelize.fn('COUNT', models_1.default.sequelize.col('emotion_id')), 'count']
                ],
                include: [{
                        model: models_1.default.Emotion,
                        attributes: ['name']
                    }],
                where: Object.assign({ user_id }, (start_date && end_date ? {
                    log_date: {
                        [sequelize_1.Op.between]: [start_date, end_date]
                    }
                } : {})),
                group: ['emotion_id', 'Emotion.name'],
                order: [[models_1.default.sequelize.literal('count'), 'DESC']]
            });
            const totalEmotions = emotionStats.reduce((sum, stat) => sum + Number(stat.getDataValue('count')), 0);
            const formattedEmotionStats = emotionStats.map(stat => ({
                emotion_id: stat.emotion_id,
                emotion_name: stat.Emotion.name,
                count: Number(stat.getDataValue('count')),
                percentage: Number(((Number(stat.getDataValue('count')) / totalEmotions) * 100).toFixed(1))
            }));
            res.json({
                status: 'success',
                data: {
                    basic_stats: stats,
                    emotion_stats: formattedEmotionStats,
                    period: {
                        type,
                        start_date,
                        end_date
                    }
                }
            });
        }
        catch (error) {
            console.error('사용자 통계 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '사용자 통계 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    updateUserStats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            // 게시물 수 집계
            const [myDayPostCount, someoneDayPostCount, myDayLikeCount, someoneDayLikeCount, myDayCommentCount, someoneDayCommentCount, challengeCount] = yield Promise.all([
                models_1.default.MyDayPost.count({
                    where: { user_id },
                    transaction
                }),
                models_1.default.SomeoneDayPost.count({
                    where: { user_id },
                    transaction
                }),
                models_1.default.MyDayLike.count({
                    include: [{
                            model: models_1.default.MyDayPost,
                            where: { user_id }
                        }],
                    transaction
                }),
                models_1.default.SomeoneDayLike.count({
                    include: [{
                            model: models_1.default.SomeoneDayPost,
                            where: { user_id }
                        }],
                    transaction
                }),
                models_1.default.MyDayComment.count({
                    include: [{
                            model: models_1.default.MyDayPost,
                            where: { user_id }
                        }],
                    transaction
                }),
                models_1.default.EncouragementMessage.count({
                    include: [{
                            model: models_1.default.SomeoneDayPost,
                            where: { user_id }
                        }],
                    transaction
                }),
                models_1.default.ChallengeParticipant.count({
                    where: {
                        user_id,
                        joined_at: {
                            [sequelize_1.Op.lte]: new Date()
                        }
                    },
                    transaction
                })
            ]);
            const [stats] = yield models_1.default.UserStats.upsert({
                user_id,
                my_day_post_count: myDayPostCount,
                someone_day_post_count: someoneDayPostCount,
                my_day_like_received_count: myDayLikeCount,
                someone_day_like_received_count: someoneDayLikeCount,
                my_day_comment_received_count: myDayCommentCount,
                someone_day_comment_received_count: someoneDayCommentCount,
                challenge_count: challengeCount
            }, { transaction });
            yield transaction.commit();
            res.json({
                status: 'success',
                message: '통계가 성공적으로 업데이트되었습니다.',
                data: { stats }
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('사용자 통계 업데이트 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '사용자 통계 업데이트 중 오류가 발생했습니다.'
            });
        }
    }),
    getEmotionTrends: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const { start_date, end_date, type = 'daily' } = req.query;
            const whereClause = { user_id };
            if (start_date && end_date) {
                whereClause.log_date = {
                    [sequelize_1.Op.between]: [start_date, end_date]
                };
            }
            const groupByClause = type === 'daily'
                ? 'DATE(log_date)'
                : type === 'weekly'
                    ? 'YEARWEEK(log_date)'
                    : 'DATE_FORMAT(log_date, "%Y-%m")';
            const trends = yield models_1.default.EmotionLog.findAll({
                attributes: [
                    [models_1.default.sequelize.fn(type === 'daily' ? 'DATE' : 'DATE_FORMAT', models_1.default.sequelize.col('log_date'), type === 'weekly' ? '%Y-%u' : '%Y-%m-%d'), 'date'],
                    'emotion_id',
                    [models_1.default.sequelize.fn('COUNT', models_1.default.sequelize.col('emotion_id')), 'count']
                ],
                include: [{
                        model: models_1.default.Emotion,
                        attributes: ['name', 'icon']
                    }],
                where: whereClause,
                group: [groupByClause, 'emotion_id', 'Emotion.name', 'Emotion.icon'],
                order: [[models_1.default.sequelize.col('date'), 'ASC']]
            });
            res.json({
                status: 'success',
                data: {
                    trends,
                    period: {
                        type,
                        start_date,
                        end_date
                    }
                }
            });
        }
        catch (error) {
            console.error('감정 트렌드 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '감정 트렌드 조회 중 오류가 발생했습니다.'
            });
        }
    })
};
exports.default = statsController;
