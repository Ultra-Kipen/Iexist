import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric, PaginationQuery } from '../types/express';

interface ChallengeQuery extends PaginationQuery {
    status?: 'active' | 'completed' | 'upcoming';
    sort_by?: 'start_date' | 'participant_count' | 'created_at';
    order?: 'asc' | 'desc';
}

interface CreateChallengeBody {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    is_public?: boolean;
    max_participants?: number;
}

interface ChallengeProgressBody {
    emotion_id: number;
    note?: string;
}

interface ChallengeParams {
    id: string;
}

const challengeController = {
    createChallenge: async (
        req: AuthRequestGeneric<CreateChallengeBody>,
        res: Response
    ) => {
        const transaction = await db.sequelize.transaction();
        try {
            const { title, description, start_date, end_date, is_public, max_participants } = req.body;
            const user_id = req.user?.user_id;  // id -> user_id로 수정

            if (!user_id) {
                await transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }

            if (!title || title.length < 5 || title.length > 100) {
                await transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '챌린지 제목은 5자 이상 100자 이하여야 합니다.'
                });
            }

            const challenge = await db.sequelize.models.challenges.create({
                creator_id: user_id,
                title,
                description: description || null,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                is_public: is_public ?? true,
                max_participants: max_participants || null,
                participant_count: 1
            }, { transaction });

            // ID를 직접 가져오기
            const challengeId = challenge.get('challenge_id');

            await db.sequelize.models.challenge_participants.create({
                challenge_id: challengeId,
                user_id,
                joined_at: new Date()
            }, { transaction });

            await transaction.commit();
            return res.status(201).json({
                status: 'success',
                message: "챌린지가 성공적으로 생성되었습니다.",
                data: {
                    challenge_id: challengeId
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error('챌린지 생성 오류:', error);
            return res.status(500).json({
                status: 'error',
                message: '챌린지 생성 중 오류가 발생했습니다.'
            });
        }
    },
    getChallenges: async (
        req: AuthRequestGeneric<never, ChallengeQuery>,
        res: Response
    ) => {
        try {
            const user_id = req.user?.user_id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }

            const { 
                page = '1', 
                limit = '10',
                status,
                sort_by = 'created_at',
                order = 'desc' 
            } = req.query;

            const offset = (Number(page) - 1) * Number(limit);
            const now = new Date();

            // 상태에 따른 조건 설정
            let whereClause: any = {};
            if (status) {
                switch (status) {
                    case 'active':
                        whereClause = {
                            start_date: { [Op.lte]: now },
                            end_date: { [Op.gte]: now }
                        };
                        break;
                    case 'completed':
                        whereClause = {
                            end_date: { [Op.lt]: now }
                        };
                        break;
                    case 'upcoming':
                        whereClause = {
                            start_date: { [Op.gt]: now }
                        };
                        break;
                }
            }

            // 정렬 조건 설정
            const orderClause: [string, string][] = [[sort_by, order]];
            if (sort_by !== 'created_at') {
                orderClause.push(['created_at', 'DESC']);
            }

            const challenges = await db.sequelize.models.challenges.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: db.sequelize.models.challenge_participants,
                       
                        attributes: ['user_id', 'joined_at']
                    }
                ],
                order: orderClause,
                limit: Number(limit),
                offset: offset,
                distinct: true
            });

            // 응답 데이터 포맷팅
            const formattedChallenges = challenges.rows.map(challenge => {
                const challengeParticipants = challenge.get('challenge_participants') || [];
                return {
                    challenge_id: challenge.get('challenge_id'),
                    title: challenge.get('title'),
                    description: challenge.get('description'),
                    start_date: challenge.get('start_date'),
                    end_date: challenge.get('end_date'),
                    is_public: challenge.get('is_public'),
                    participant_count: challenge.get('participant_count'),
                    created_at: challenge.get('created_at'),
                    is_participated: Array.isArray(challengeParticipants) && 
                        challengeParticipants.filter((participant: any) => 
                            participant.user_id === user_id).length > 0
                };
            });

            return res.json({
                status: 'success',
                data: {
                    challenges: formattedChallenges,
                    pagination: {
                        current_page: Number(page),
                        total_pages: Math.ceil(challenges.count / Number(limit)),
                        total_count: challenges.count,
                        has_next: offset + Number(limit) < challenges.count
                    }
                }
            });
        } catch (error) {
            console.error('챌린지 목록 조회 오류:', error);
            return res.status(500).json({
                status: 'error',
                message: '챌린지 목록을 조회하는 중 오류가 발생했습니다.'
            });
        }
    },

    participateInChallenge: async (
        req: AuthRequestGeneric<never, never, ChallengeParams>,
        res: Response
    ) => {
        const transaction = await db.sequelize.transaction();
        try {
            const challengeId = Number(req.params.id);
            const user_id = req.user?.user_id;

            if (!user_id) {
                await transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }

            const challenge = await db.sequelize.models.challenges.findOne({
                where: { challenge_id: challengeId },
                transaction
            });

            if (!challenge) {
                await transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '챌린지를 찾을 수 없습니다.'
                });
            }

            const maxParticipants = Number(challenge.get('max_participants'));
            const currentParticipants = Number(challenge.get('participant_count'));
            
            if (!isNaN(maxParticipants) && !isNaN(currentParticipants) && currentParticipants >= maxParticipants) {
                await transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '참가자 수가 초과되었습니다.'
                });
            }

            const existingParticipant = await db.sequelize.models.challenge_participants.findOne({
                where: {
                    challenge_id: challengeId,
                    user_id
                },
                transaction
            });

            if (existingParticipant) {
                await transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '이미 참가 중인 챌린지입니다.'
                });
            }

            await db.sequelize.models.challenge_participants.create({
                challenge_id: challengeId,
                user_id,
                joined_at: new Date()
            }, { transaction });

            await challenge.increment('participant_count', { transaction });

            await transaction.commit();
            return res.json({
                status: 'success',
                message: '챌린지에 성공적으로 참가했습니다.'
            });
        } catch (error) {
            await transaction.rollback();
            console.error('챌린지 참가 오류:', error);
            return res.status(500).json({
                status: 'error',
                message: '챌린지 참가 중 오류가 발생했습니다.'
            });
        }
    },
     updateChallengeProgress: async (
        req: AuthRequestGeneric<ChallengeProgressBody, any, ChallengeParams>,
        res: Response
    ) => {
        const transaction = await db.sequelize.transaction();
        try {
            const { note, emotion_id } = req.body;
            const challengeId = Number(req.params.id);
            const user_id = req.user?.user_id;  // id -> user_id로 수정

            if (!user_id) {
                await transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }

            const existingLog = await db.sequelize.models.challenge_emotions.findOne({
                where: {
                    challenge_id: challengeId,
                    user_id,
                    log_date: {
                        [Op.gte]: new Date().setHours(0,0,0,0),
                        [Op.lt]: new Date().setHours(23,59,59,999)
                    }
                },
                transaction
            });

            if (existingLog) {
                await transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '오늘은 이미 진행 상황을 기록했습니다.'
                });
            }

            const emotionLog = await db.sequelize.models.challenge_emotions.create({
                challenge_id: challengeId,
                user_id,
                emotion_id,
                log_date: new Date(),
                note: note || null
            }, { transaction });

            // ID를 직접 가져오기
            const emotionLogId = emotionLog.get('challenge_emotion_id');

            await transaction.commit();
            return res.json({
                status: 'success',
                message: '진행 상황이 기록되었습니다.',
                data: {
                    challenge_emotion_id: emotionLogId
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error('진행 상황 기록 오류:', error);
            return res.status(500).json({
                status: 'error',
                message: '진행 상황 기록 중 오류가 발생했습니다.'
            });
        }
    }
};

export default challengeController;