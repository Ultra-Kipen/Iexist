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
const someoneDayController = {
    createPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { title, content, image_url, is_anonymous, tag_ids } = req.body;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (!title || title.length < 5 || title.length > 100) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '제목은 5자 이상 100자 이하여야 합니다.'
                });
            }
            if (!content || content.length < 20 || content.length > 2000) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '게시물 내용은 20자 이상 2000자 이하여야 합니다.'
                });
            }
            const post = yield models_1.default.SomeoneDayPost.create({
                user_id,
                title,
                content,
                image_url,
                summary: content.substring(0, 200),
                is_anonymous: is_anonymous || false,
                character_count: content.length
            }, { transaction });
            if (tag_ids && tag_ids.length > 0) {
                const tags = yield models_1.default.Tag.findAll({
                    where: { tag_id: { [sequelize_1.Op.in]: tag_ids } },
                    transaction
                });
                if (tags.length !== tag_ids.length) {
                    yield transaction.rollback();
                    return res.status(400).json({
                        status: 'error',
                        message: '유효하지 않은 태그가 포함되어 있습니다.'
                    });
                }
                yield post.addTags(tag_ids, { transaction });
            }
            yield models_1.default.UserStats.increment('someone_day_post_count', {
                where: { user_id },
                transaction
            });
            yield transaction.commit();
            res.status(201).json({
                status: 'success',
                message: "게시물이 성공적으로 생성되었습니다.",
                data: {
                    post_id: post.post_id
                }
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('게시물 생성 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '게시물 생성 중 오류가 발생했습니다.'
            });
        }
    }),
    getPosts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const { page = '1', limit = '10', tag, sort_by = 'latest', start_date, end_date } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const whereClause = {};
            if (tag) {
                whereClause['$Tags.name$'] = tag;
            }
            if (start_date && end_date) {
                whereClause.created_at = {
                    [sequelize_1.Op.between]: [new Date(start_date), new Date(end_date)]
                };
            }
            const orderClause = sort_by === 'popular'
                ? [
                    ['like_count', 'DESC'],
                    ['message_count', 'DESC'],
                    ['created_at', 'DESC']
                ]
                : [['created_at', 'DESC']];
            const posts = yield models_1.default.SomeoneDayPost.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.default.User,
                        attributes: ['nickname', 'profile_image_url']
                    },
                    {
                        model: models_1.default.Tag,
                        through: { attributes: [] },
                        attributes: ['tag_id', 'name']
                    },
                    {
                        model: models_1.default.EncouragementMessage,
                        separate: true,
                        limit: 3,
                        order: [['created_at', 'DESC']],
                        include: [{
                                model: models_1.default.User,
                                attributes: ['nickname']
                            }]
                    }
                ],
                order: orderClause,
                limit: Number(limit),
                offset,
                distinct: true
            });
            const formattedPosts = posts.rows.map(post => {
                var _a;
                return (Object.assign(Object.assign({}, post.toJSON()), { User: post.is_anonymous ? null : post.User, message_preview: (_a = post.EncouragementMessages) === null || _a === void 0 ? void 0 : _a.slice(0, 3), total_messages: post.message_count, total_likes: post.like_count }));
            });
            res.json({
                status: 'success',
                data: {
                    posts: formattedPosts,
                    pagination: {
                        current_page: Number(page),
                        total_pages: Math.ceil(posts.count / Number(limit)),
                        total_count: posts.count,
                        has_next: offset + Number(limit) < posts.count
                    }
                }
            });
        }
        catch (error) {
            console.error('게시물 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '게시물 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    getPopularPosts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const posts = yield models_1.default.SomeoneDayPost.findAll({
                include: [
                    {
                        model: models_1.default.User,
                        attributes: ['nickname', 'profile_image_url']
                    },
                    {
                        model: models_1.default.Tag,
                        through: { attributes: [] },
                        attributes: ['tag_id', 'name']
                    },
                    {
                        model: models_1.default.EncouragementMessage,
                        attributes: []
                    }
                ],
                attributes: {
                    include: [
                        [
                            models_1.default.sequelize.fn('COUNT', models_1.default.sequelize.col('EncouragementMessages.message_id')),
                            'message_count'
                        ]
                    ]
                },
                group: ['SomeoneDayPost.post_id', 'User.user_id', 'Tags.tag_id'],
                order: [
                    [models_1.default.sequelize.literal('message_count'), 'DESC'],
                    ['like_count', 'DESC']
                ],
                limit: 10,
                where: {
                    created_at: {
                        [sequelize_1.Op.gte]: models_1.default.sequelize.literal('DATE_SUB(NOW(), INTERVAL 7 DAY)')
                    }
                }
            });
            const formattedPosts = posts.map(post => (Object.assign(Object.assign({}, post.toJSON()), { User: post.is_anonymous ? null : post.User })));
            res.json({
                status: 'success',
                data: {
                    posts: formattedPosts
                }
            });
        }
        catch (error) {
            console.error('인기 게시물 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '인기 게시물 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    reportPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { id } = req.params;
            const { reason, details } = req.body;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (!reason || reason.length < 5 || reason.length > 200) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '신고 이유는 5자 이상 200자 이하여야 합니다.'
                });
            }
            const existingReport = yield models_1.default.PostReport.findOne({
                where: {
                    post_id: id,
                    reporter_id: user_id
                },
                transaction
            });
            if (existingReport) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '이미 신고한 게시물입니다.'
                });
            }
            yield models_1.default.PostReport.create({
                post_id: id,
                reporter_id: user_id,
                reason,
                details
            }, { transaction });
            yield transaction.commit();
            res.json({
                status: 'success',
                message: "게시물이 성공적으로 신고되었습니다. 관리자가 검토 후 조치하겠습니다."
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('게시물 신고 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '게시물 신고 중 오류가 발생했습니다.'
            });
        }
    })
};
exports.default = someoneDayController;
