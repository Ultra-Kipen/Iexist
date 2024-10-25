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
// 헬퍼 함수들을 객체 외부에서 정의
function formatEmotionStats(stats) {
    return stats.reduce((acc, curr) => {
        const date = curr.get('date');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push({
            emotion: curr.get('name'),
            icon: curr.get('icon'),
            count: parseInt(curr.get('count'))
        });
        return acc;
    }, {});
}
function formatEmotionTrend(trend, groupBy) {
    return trend.reduce((acc, curr) => {
        const date = curr.get('date');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push({
            emotion: curr.get('name'),
            icon: curr.get('icon'),
            count: parseInt(curr.get('count'))
        });
        return acc;
    }, {});
}
function getGroupByClause(groupBy) {
    switch (groupBy) {
        case 'week':
            return models_1.default.sequelize.fn('DATE_FORMAT', models_1.default.sequelize.col('log_date'), '%Y-%U');
        case 'month':
            return models_1.default.sequelize.fn('DATE_FORMAT', models_1.default.sequelize.col('log_date'), '%Y-%m');
        default:
            return models_1.default.sequelize.fn('DATE', models_1.default.sequelize.col('log_date'));
    }
}
const emotionController = {
    getAllEmotions: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const emotions = yield models_1.default.Emotion.findAll({
                attributes: ['emotion_id', 'name', 'icon'],
                order: [['name', 'ASC']]
            });
            res.json({
                status: 'success',
                data: emotions
            });
        }
        catch (error) {
            console.error('감정 목록 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '감정 목록 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    getEmotions: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const { limit = '30', offset = '0' } = req.query;
            const emotions = yield models_1.default.EmotionLog.findAndCountAll({
                where: { user_id },
                include: [{
                        model: models_1.default.Emotion,
                        attributes: ['name', 'icon']
                    }],
                order: [['log_date', 'DESC']],
                limit: Number(limit),
                offset: Number(offset),
                attributes: ['log_id', 'log_date', 'note']
            });
            res.json({
                status: 'success',
                data: emotions.rows,
                pagination: {
                    total: emotions.count,
                    limit: Number(limit),
                    offset: Number(offset),
                    total_pages: Math.ceil(emotions.count / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('감정 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '감정 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    createEmotion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { emotion_ids, note } = req.body;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (!emotion_ids || !Array.isArray(emotion_ids) || emotion_ids.length === 0) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '하나 이상의 감정을 선택해주세요.'
                });
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const existingLog = yield models_1.default.EmotionLog.findOne({
                where: {
                    user_id,
                    log_date: today
                },
                transaction
            });
            if (existingLog) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '오늘의 감정은 이미 기록되었습니다.'
                });
            }
            const emotionLogs = yield Promise.all(emotion_ids.map(emotion_id => models_1.default.EmotionLog.create({
                user_id,
                emotion_id,
                log_date: today,
                note
            }, { transaction })));
            yield transaction.commit();
            res.status(201).json({
                status: 'success',
                message: "감정이 성공적으로 기록되었습니다.",
                data: emotionLogs
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('감정 기록 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '감정 기록 중 오류가 발생했습니다.'
            });
        }
    }),
    getEmotionStats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const { start_date, end_date } = req.query;
            const stats = yield models_1.default.EmotionLog.findAll({
                attributes: [
                    [models_1.default.sequelize.fn('DATE', models_1.default.sequelize.col('log_date')), 'date'],
                    'Emotion.name',
                    'Emotion.icon',
                    [models_1.default.sequelize.fn('COUNT', models_1.default.sequelize.col('EmotionLog.emotion_id')), 'count']
                ],
                include: [{
                        model: models_1.default.Emotion,
                        attributes: []
                    }],
                where: {
                    user_id,
                    log_date: {
                        [sequelize_1.Op.between]: [start_date, end_date]
                    }
                },
                group: [
                    models_1.default.sequelize.fn('DATE', models_1.default.sequelize.col('log_date')),
                    'Emotion.name',
                    'Emotion.icon'
                ],
                order: [
                    [models_1.default.sequelize.fn('DATE', models_1.default.sequelize.col('log_date')), 'ASC'],
                    [models_1.default.sequelize.literal('count'), 'DESC']
                ]
            });
            const formattedStats = formatEmotionStats(stats);
            res.json({
                status: 'success',
                data: formattedStats
            });
        }
        catch (error) {
            console.error('감정 통계 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '감정 통계 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    getEmotionTrend: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const { start_date, end_date, group_by = 'day' } = req.query;
            const groupByClause = getGroupByClause(group_by);
            const trend = yield models_1.default.EmotionLog.findAll({
                attributes: [
                    [groupByClause, 'date'],
                    'Emotion.name',
                    'Emotion.icon',
                    [models_1.default.sequelize.fn('COUNT', '*'), 'count']
                ],
                include: [{
                        model: models_1.default.Emotion,
                        attributes: []
                    }],
                where: {
                    user_id,
                    log_date: { [sequelize_1.Op.between]: [start_date, end_date] }
                },
                group: [groupByClause, 'Emotion.name', 'Emotion.icon'],
                order: [[groupByClause, 'ASC']]
            });
            const formattedTrend = formatEmotionTrend(trend, group_by);
            res.json({
                status: 'success',
                data: formattedTrend
            });
        }
        catch (error) {
            console.error('감정 추세 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '감정 추세 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    getDailyEmotionCheck: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const check = yield models_1.default.EmotionLog.findOne({
                where: {
                    user_id,
                    log_date: today
                },
                include: [{
                        model: models_1.default.Emotion,
                        attributes: ['name', 'icon']
                    }]
            });
            res.json({
                status: 'success',
                data: {
                    hasDailyCheck: !!check,
                    lastCheck: check
                }
            });
        }
        catch (error) {
            console.error('일일 감정 체크 확인 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '일일 감정 체크 확인 중 오류가 발생했습니다.'
            });
        }
    })
};
exports.default = emotionController;
