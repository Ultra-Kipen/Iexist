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
const postController = {
    createPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { content, emotion_summary, image_url, is_anonymous, emotion_ids } = req.body;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (!content || content.length < 10 || content.length > 1000) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '게시물 내용은 10자 이상 1000자 이하여야 합니다.'
                });
            }
            const post = yield models_1.default.MyDayPost.create({
                user_id,
                content,
                emotion_summary,
                image_url,
                is_anonymous: is_anonymous || false,
                character_count: content.length
            }, { transaction });
            if (emotion_ids && emotion_ids.length > 0) {
                const emotions = yield models_1.default.Emotion.findAll({
                    where: { emotion_id: { [sequelize_1.Op.in]: emotion_ids } },
                    transaction
                });
                if (emotions.length !== emotion_ids.length) {
                    yield transaction.rollback();
                    return res.status(400).json({
                        status: 'error',
                        message: '유효하지 않은 감정이 포함되어 있습니다.'
                    });
                }
                yield post.addEmotions(emotion_ids, { transaction });
            }
            yield models_1.default.UserStats.increment('my_day_post_count', {
                where: { user_id },
                transaction
            });
            yield transaction.commit();
            res.status(201).json({
                status: 'success',
                message: "오늘 하루의 기록이 성공적으로 저장되었습니다.",
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
                message: '게시물 저장 중 오류가 발생했습니다.'
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
            const { page = '1', limit = '10', emotion, start_date, end_date, sort_by = 'latest' } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const whereClause = {};
            if (emotion) {
                whereClause['$Emotions.name$'] = emotion;
            }
            if (start_date && end_date) {
                whereClause.created_at = {
                    [sequelize_1.Op.between]: [new Date(start_date), new Date(end_date)]
                };
            }
            const orderClause = sort_by === 'popular'
                ? [['like_count', 'DESC'], ['comment_count', 'DESC'], ['created_at', 'DESC']]
                : [['created_at', 'DESC']];
            const posts = yield models_1.default.MyDayPost.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.default.User,
                        attributes: ['nickname', 'profile_image_url']
                    },
                    {
                        model: models_1.default.Emotion,
                        through: { attributes: [] },
                        attributes: ['emotion_id', 'name', 'icon']
                    },
                    {
                        model: models_1.default.MyDayComment,
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
            const formattedPosts = posts.rows.map((post) => {
                var _a;
                return (Object.assign(Object.assign({}, post.toJSON()), { User: post.is_anonymous ? null : post.User, comment_preview: (_a = post.MyDayComments) === null || _a === void 0 ? void 0 : _a.slice(0, 3), total_comments: post.comment_count, total_likes: post.like_count }));
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
    getMyPosts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const { page = '1', limit = '10', start_date, end_date } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const whereClause = { user_id };
            if (start_date && end_date) {
                whereClause.created_at = {
                    [sequelize_1.Op.between]: [new Date(start_date), new Date(end_date)]
                };
            }
            const posts = yield models_1.default.MyDayPost.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.default.Emotion,
                        through: { attributes: [] },
                        attributes: ['emotion_id', 'name', 'icon']
                    },
                    {
                        model: models_1.default.MyDayComment,
                        separate: true,
                        limit: 3,
                        order: [['created_at', 'DESC']],
                        include: [{
                                model: models_1.default.User,
                                attributes: ['nickname']
                            }]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: Number(limit),
                offset
            });
            res.json({
                status: 'success',
                data: {
                    posts: posts.rows,
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
            console.error('내 게시물 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '내 게시물 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    createComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { id } = req.params;
            const { content, is_anonymous } = req.body;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (!content || content.length < 1 || content.length > 300) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '댓글 내용은 1자 이상 300자 이하여야 합니다.'
                });
            }
            const post = yield models_1.default.MyDayPost.findByPk(id, { transaction });
            if (!post) {
                yield transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '게시물을 찾을 수 없습니다.'
                });
            }
            const comment = yield models_1.default.MyDayComment.create({
                post_id: id,
                user_id,
                content,
                is_anonymous: is_anonymous || false
            }, { transaction });
            yield post.increment('comment_count', { transaction });
            if (post.user_id !== user_id) {
                yield models_1.default.Notification.create({
                    user_id: post.user_id,
                    content: '회원님의 게시물에 새로운 댓글이 달렸습니다.',
                    notification_type: 'comment',
                    related_id: comment.comment_id
                }, { transaction });
            }
            yield transaction.commit();
            res.status(201).json({
                status: 'success',
                message: '댓글이 성공적으로 작성되었습니다.',
                data: {
                    comment_id: comment.comment_id
                }
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('댓글 작성 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '댓글 작성 중 오류가 발생했습니다.'
            });
        }
    }),
    likePost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { id } = req.params;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const post = yield models_1.default.MyDayPost.findByPk(id, { transaction });
            if (!post) {
                yield transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '게시물을 찾을 수 없습니다.'
                });
            }
            const [like, created] = yield models_1.default.MyDayLike.findOrCreate({
                where: { user_id, post_id: id },
                transaction
            });
            if (created) {
                yield post.increment('like_count', { transaction });
                if (post.user_id !== user_id) {
                    yield models_1.default.Notification.create({
                        user_id: post.user_id,
                        content: '회원님의 게시물에 새로운 공감이 추가되었습니다.',
                        notification_type: 'like',
                        related_id: post.post_id
                    }, { transaction });
                }
                yield transaction.commit();
                res.json({
                    status: 'success',
                    message: '게시물에 공감을 표시했습니다.'
                });
            }
            else {
                yield like.destroy({ transaction });
                yield post.decrement('like_count', { transaction });
                yield transaction.commit();
                res.json({
                    status: 'success',
                    message: '게시물 공감을 취소했습니다.'
                });
            }
        }
        catch (error) {
            yield transaction.rollback();
            console.error('공감 처리 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '공감 처리 중 오류가 발생했습니다.'
            });
        }
    })
};
exports.default = postController;
