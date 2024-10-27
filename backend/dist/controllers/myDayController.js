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
// 유틸리티 함수
const checkAuth = (userId) => {
    return userId !== undefined;
};
const validateContent = (content, minLength, maxLength) => {
    if (typeof content !== 'string')
        return false;
    return content.length >= minLength && content.length <= maxLength;
};
const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};
const formatPaginationData = (count, page, limit, offset) => ({
    current_page: page,
    total_pages: Math.ceil(count / limit),
    total_count: count,
    has_next: offset + limit < count
});
const myDayController = {
    createPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { content, emotion_summary, image_url, is_anonymous, emotion_ids } = req.body;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!checkAuth(user_id)) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (!validateContent(content, 10, 1000)) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '게시물 내용은 10자 이상 1000자 이하여야 합니다.'
                });
            }
            // 오늘 하루 게시물 체크
            const today = getTodayStart();
            const existingPost = yield models_1.default.MyDayPost.findOne({
                where: {
                    user_id,
                    created_at: {
                        [sequelize_1.Op.gte]: today
                    }
                },
                transaction
            });
            if (existingPost) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '오늘의 게시물은 이미 작성되었습니다.'
                });
            }
            // 게시물 생성
            const post = yield models_1.default.MyDayPost.create({
                user_id,
                content,
                emotion_summary,
                image_url,
                is_anonymous: is_anonymous || false,
                character_count: content.length
            }, { transaction });
            // 감정 태그 처리
            if (emotion_ids === null || emotion_ids === void 0 ? void 0 : emotion_ids.length) {
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
            // 통계 업데이트
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
            if (!checkAuth(user_id)) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const { page = '1', limit = '10', emotion, start_date, end_date, sort_by = 'latest' } = req.query;
            const pageNum = Number(page);
            const limitNum = Number(limit);
            const offset = (pageNum - 1) * limitNum;
            // 쿼리 조건 구성
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
                limit: limitNum,
                offset,
                distinct: true
            });
            const formattedPosts = posts.rows.map((post) => {
                var _a;
                const postJson = post.toJSON();
                return Object.assign(Object.assign({}, postJson), { User: post.is_anonymous ? null : postJson.User, comment_preview: (_a = postJson.MyDayComments) === null || _a === void 0 ? void 0 : _a.slice(0, 3), total_comments: post.comment_count, total_likes: post.like_count });
            });
            res.json({
                status: 'success',
                data: {
                    posts: formattedPosts,
                    pagination: formatPaginationData(posts.count, pageNum, limitNum, offset)
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
    createComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { id } = req.params;
            const { content, is_anonymous } = req.body;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!checkAuth(user_id)) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (!validateContent(content, 1, 300)) {
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
            if (!checkAuth(user_id)) {
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
                        content: '회원님의 게시물에 새로운 좋아요가 추가되었습니다.',
                        notification_type: 'like',
                        related_id: post.post_id
                    }, { transaction });
                }
                yield transaction.commit();
                res.json({
                    status: 'success',
                    message: '게시물에 좋아요를 표시했습니다.'
                });
            }
            else {
                yield like.destroy({ transaction });
                yield post.decrement('like_count', { transaction });
                yield transaction.commit();
                res.json({
                    status: 'success',
                    message: '게시물 좋아요를 취소했습니다.'
                });
            }
        }
        catch (error) {
            yield transaction.rollback();
            console.error('좋아요 처리 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '좋아요 처리 중 오류가 발생했습니다.'
            });
        }
    })
};
exports.default = myDayController;
