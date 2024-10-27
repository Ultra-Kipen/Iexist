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
const comfortWallController = {
    createComfortWallPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { title, content, is_anonymous, emotion_ids } = req.body;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({ message: '인증이 필요합니다.' });
            }
            if (!title || title.length < 5 || title.length > 100) {
                yield transaction.rollback();
                return res.status(400).json({ message: '제목은 5자 이상 100자 이하여야 합니다.' });
            }
            if (!content || content.length < 20 || content.length > 2000) {
                yield transaction.rollback();
                return res.status(400).json({ message: '게시물 내용은 20자 이상 2000자 이하여야 합니다.' });
            }
            const post = yield models_1.default.SomeoneDayPost.create({
                user_id,
                title,
                content,
                is_anonymous: is_anonymous || false,
                character_count: content.length,
                summary: content.slice(0, 200)
            }, { transaction });
            if (emotion_ids && emotion_ids.length > 0) {
                yield post.addEmotions(emotion_ids, { transaction });
            }
            yield transaction.commit();
            res.status(201).json({
                message: "위로와 공감 게시물이 성공적으로 생성되었습니다.",
                post_id: post.post_id
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('위로와 공감 게시물 생성 오류:', error);
            res.status(500).json({ message: '게시물 생성 중 오류가 발생했습니다.' });
        }
    }),
    getComfortWallPosts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { page = '1', limit = '10', emotion, sortBy = 'latest' } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const whereClause = {};
            if (emotion) {
                whereClause['$Emotions.name$'] = emotion;
            }
            const orderClause = sortBy === 'popular'
                ? [['message_count', 'DESC'], ['created_at', 'DESC']]
                : [['created_at', 'DESC']];
            const posts = yield models_1.default.SomeoneDayPost.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.default.User,
                        attributes: ['nickname', 'profile_image_url'],
                        where: { user_id: { [sequelize_1.Op.ne]: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } }
                    },
                    {
                        model: models_1.default.Emotion,
                        through: { attributes: [] },
                        attributes: ['name', 'icon']
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
            const formattedPosts = posts.rows.map((post) => {
                var _a;
                return (Object.assign(Object.assign({}, post.toJSON()), { User: post.is_anonymous ? null : post.User, message_preview: (_a = post.EncouragementMessages) === null || _a === void 0 ? void 0 : _a.slice(0, 3), total_messages: post.message_count }));
            });
            res.json({
                posts: formattedPosts,
                totalPages: Math.ceil(posts.count / Number(limit)),
                currentPage: Number(page),
                totalCount: posts.count
            });
        }
        catch (error) {
            console.error('위로와 공감 게시물 조회 오류:', error);
            res.status(500).json({ message: '게시물 조회 중 오류가 발생했습니다.' });
        }
    }),
    createComfortMessage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { id } = req.params;
            const { message } = req.body;
            const sender_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!sender_id) {
                yield transaction.rollback();
                return res.status(401).json({ message: '인증이 필요합니다.' });
            }
            // 게시물 존재 여부 확인
            const post = yield models_1.default.SomeoneDayPost.findByPk(id, { transaction });
            if (!post) {
                yield transaction.rollback();
                return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
            }
            // 자신의 게시물에는 위로 메시지를 보낼 수 없음
            if (post.user_id === sender_id) {
                yield transaction.rollback();
                return res.status(400).json({ message: '자신의 게시물에는 위로 메시지를 보낼 수 없습니다.' });
            }
            if (!message || message.length < 5 || message.length > 500) {
                yield transaction.rollback();
                return res.status(400).json({ message: '위로의 메시지는 5자 이상 500자 이하여야 합니다.' });
            }
            const encouragementMessage = yield models_1.default.EncouragementMessage.create({
                sender_id,
                receiver_id: post.user_id,
                post_id: id,
                message
            }, { transaction });
            yield post.increment('message_count', { transaction });
            // 알림 생성
            yield models_1.default.Notification.create({
                user_id: post.user_id,
                content: '회원님의 게시물에 새로운 위로의 메시지가 도착했습니다.',
                notification_type: 'comment',
                related_id: encouragementMessage.message_id
            }, { transaction });
            yield transaction.commit();
            res.status(201).json({
                message: "위로의 메시지가 성공적으로 전송되었습니다.",
                message_id: encouragementMessage.message_id
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('위로의 메시지 전송 오류:', error);
            res.status(500).json({ message: '위로의 메시지 전송 중 오류가 발생했습니다.' });
        }
    })
};
exports.default = comfortWallController;
