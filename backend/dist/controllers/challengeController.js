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
const challengeController = {
    createChallenge: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { title, description, start_date, end_date, is_public, max_participants } = req.body;
            const creator_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!creator_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            // Validation
            if (!title || title.length < 5 || title.length > 100) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '챌린지 제목은 5자 이상 100자 이하여야 합니다.'
                });
            }
            if (description && (description.length < 20 || description.length > 500)) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '챌린지 설명은 20자 이상 500자 이하여야 합니다.'
                });
            }
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const now = new Date();
            if (startDate < now) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '시작일은 현재 시간 이후여야 합니다.'
                });
            }
            if (endDate <= startDate) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '종료일은 시작일 이후여야 합니다.'
                });
            }
            const challenge = yield models_1.default.Challenge.create({
                creator_id,
                title,
                description,
                start_date: startDate,
                end_date: endDate,
                is_public: is_public !== null && is_public !== void 0 ? is_public : true,
                max_participants,
                participant_count: 1
            }, { transaction });
            yield models_1.default.ChallengeParticipant.create({
                challenge_id: challenge.challenge_id,
                user_id: creator_id
            }, { transaction });
            yield transaction.commit();
            res.status(201).json({
                status: 'success',
                message: "챌린지가 성공적으로 생성되었습니다.",
                data: {
                    challenge_id: challenge.challenge_id
                }
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('챌린지 생성 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '챌린지 생성 중 오류가 발생했습니다.'
            });
        }
    }),
    getChallenges: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { page = '1', limit = '10', status, sort_by = 'start_date', order = 'asc' } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const currentDate = new Date();
            let whereClause = {};
            if (status) {
                switch (status) {
                    case 'active':
                        whereClause = {
                            start_date: { [sequelize_1.Op.lte]: currentDate },
                            end_date: { [sequelize_1.Op.gte]: currentDate }
                        };
                        break;
                    case 'completed':
                        whereClause = {
                            end_date: { [sequelize_1.Op.lt]: currentDate }
                        };
                        break;
                    case 'upcoming':
                        whereClause = {
                            start_date: { [sequelize_1.Op.gt]: currentDate }
                        };
                        break;
                }
            }
            const orderClause = [[sort_by, order.toUpperCase()]];
            const challenges = yield models_1.default.Challenge.findAndCountAll({
                include: [
                    {
                        model: models_1.default.User,
                        as: 'Creator',
                        attributes: ['nickname', 'profile_image_url']
                    },
                    {
                        model: models_1.default.ChallengeParticipant,
                        attributes: ['user_id'],
                        include: [{
                                model: models_1.default.User,
                                attributes: ['nickname', 'profile_image_url']
                            }],
                        separate: true,
                        limit: 5
                    }
                ],
                where: whereClause,
                order: orderClause,
                limit: Number(limit),
                offset,
                distinct: true
            });
            res.json({
                status: 'success',
                data: {
                    challenges: challenges.rows,
                    pagination: {
                        current_page: Number(page),
                        total_pages: Math.ceil(challenges.count / Number(limit)),
                        total_count: challenges.count,
                        has_next: offset + Number(limit) < challenges.count
                    }
                }
            });
        }
        catch (error) {
            console.error('챌린지 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '챌린지 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    participateInChallenge: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const challenge = yield models_1.default.Challenge.findByPk(id, { transaction });
            if (!challenge) {
                yield transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '챌린지를 찾을 수 없습니다.'
                });
            }
            const now = new Date();
            if (challenge.end_date < now) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '이미 종료된 챌린지입니다.'
                });
            }
            if (challenge.max_participants && challenge.participant_count >= challenge.max_participants) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '챌린지 참가 인원이 가득 찼습니다.'
                });
            }
            const [participant, created] = yield models_1.default.ChallengeParticipant.findOrCreate({
                where: { challenge_id: id, user_id },
                transaction
            });
            if (!created) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '이미 이 챌린지에 참여 중입니다.'
                });
            }
            yield challenge.increment('participant_count', { transaction });
            // 챌린지 생성자에게 알림 전송
            if (challenge.creator_id !== user_id) {
                yield models_1.default.Notification.create({
                    user_id: challenge.creator_id,
                    content: `새로운 참가자가 "${challenge.title}" 챌린지에 참여했습니다.`,
                    notification_type: 'challenge',
                    related_id: challenge.challenge_id
                }, { transaction });
            }
            yield transaction.commit();
            res.json({
                status: 'success',
                message: "챌린지에 성공적으로 참여했습니다."
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('챌린지 참여 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '챌린지 참여 중 오류가 발생했습니다.'
            });
        }
    }),
    updateChallengeProgress: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { id } = req.params;
            const { progress_note, emotion_id } = req.body;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (!progress_note || progress_note.length > 500) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '진행 상황 노트는 1자 이상 500자 이하여야 합니다.'
                });
            }
            const [participant, challenge] = yield Promise.all([
                models_1.default.ChallengeParticipant.findOne({
                    where: { challenge_id: id, user_id },
                    transaction
                }),
                models_1.default.Challenge.findByPk(id, { transaction })
            ]);
            if (!participant) {
                yield transaction.rollback();
                return res.status(403).json({
                    status: 'error',
                    message: '이 챌린지에 참여하지 않았습니다.'
                });
            }
            if (!challenge) {
                yield transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '챌린지를 찾을 수 없습니다.'
                });
            }
            const now = new Date();
            if (challenge.end_date < now || challenge.start_date > now) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '현재 진행 중인 챌린지가 아닙니다.'
                });
            }
            // 오늘 이미 기록했는지 확인
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const existingLog = yield models_1.default.ChallengeEmotion.findOne({
                where: {
                    challenge_id: id,
                    user_id,
                    log_date: {
                        [sequelize_1.Op.gte]: today,
                        [sequelize_1.Op.lt]: tomorrow
                    }
                },
                transaction
            });
            if (existingLog) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '오늘은 이미 진행 상황을 기록했습니다.'
                });
            }
            const challengeEmotion = yield models_1.default.ChallengeEmotion.create({
                challenge_id: id,
                user_id,
                emotion_id,
                log_date: now,
                note: progress_note
            }, { transaction });
            yield transaction.commit();
            res.json({
                status: 'success',
                message: "챌린지 진행 상황이 성공적으로 업데이트되었습니다.",
                data: {
                    emotion_log_id: challengeEmotion.challenge_emotion_id
                }
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('챌린지 진행 상황 업데이트 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '챌린지 진행 상황 업데이트 중 오류가 발생했습니다.'
            });
        }
    })
};
exports.default = challengeController;
