import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequest, PaginationQuery } from '../types/express';

interface CreateChallengeBody {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_public?: boolean;
  max_participants?: number;
}

interface ChallengeProgressBody {
  progress_note: string;
  emotion_id: number;
}

interface ChallengeParams {
  id: string;
}

interface ChallengeQuery extends PaginationQuery {
  status?: 'active' | 'completed' | 'upcoming';
  sort_by?: 'start_date' | 'participant_count' | 'created_at';
  order?: 'asc' | 'desc';
}

const challengeController = {
  createChallenge: async (
    req: AuthRequest<CreateChallengeBody>,
    res: Response
  ) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { title, description, start_date, end_date, is_public, max_participants } = req.body;
      const creator_id = req.user?.id;

      if (!creator_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      // Validation
      if (!title || title.length < 5 || title.length > 100) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '챌린지 제목은 5자 이상 100자 이하여야 합니다.'
        });
      }

      if (description && (description.length < 20 || description.length > 500)) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '챌린지 설명은 20자 이상 500자 이하여야 합니다.'
        });
      }

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const now = new Date();

      if (startDate < now) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '시작일은 현재 시간 이후여야 합니다.'
        });
      }

      if (endDate <= startDate) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '종료일은 시작일 이후여야 합니다.'
        });
      }

      const challenge = await db.Challenge.create({
        creator_id,
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        is_public: is_public ?? true,
        max_participants,
        participant_count: 1
      }, { transaction });

      await db.ChallengeParticipant.create({
        challenge_id: challenge.challenge_id,
        user_id: creator_id
      }, { transaction });

      await transaction.commit();
      res.status(201).json({
        status: 'success',
        message: "챌린지가 성공적으로 생성되었습니다.",
        data: {
          challenge_id: challenge.challenge_id
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('챌린지 생성 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '챌린지 생성 중 오류가 발생했습니다.'
      });
    }
  },

  getChallenges: async (
    req: AuthRequest<any, ChallengeQuery>,
    res: Response
  ) => {
    try {
      const {
        page = '1',
        limit = '10',
        status,
        sort_by = 'start_date',
        order = 'asc'
      } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      const currentDate = new Date();

      let whereClause: any = {};
      if (status) {
        switch (status) {
          case 'active':
            whereClause = {
              start_date: { [Op.lte]: currentDate },
              end_date: { [Op.gte]: currentDate }
            };
            break;
          case 'completed':
            whereClause = {
              end_date: { [Op.lt]: currentDate }
            };
            break;
          case 'upcoming':
            whereClause = {
              start_date: { [Op.gt]: currentDate }
            };
            break;
        }
      }

      const orderClause = [[sort_by, order.toUpperCase()]];
      
      const challenges = await db.Challenge.findAndCountAll({
        include: [
          {
            model: db.User,
            as: 'Creator',
            attributes: ['nickname', 'profile_image_url']
          },
          {
            model: db.ChallengeParticipant,
            attributes: ['user_id'],
            include: [{
              model: db.User,
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
    } catch (error) {
      console.error('챌린지 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '챌린지 조회 중 오류가 발생했습니다.'
      });
    }
  },

  participateInChallenge: async (
    req: AuthRequest<any, any, ChallengeParams>,
    res: Response
  ) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const challenge = await db.Challenge.findByPk(id, { transaction });

      if (!challenge) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
      }

      const now = new Date();
      if (challenge.end_date < now) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '이미 종료된 챌린지입니다.'
        });
      }

      if (challenge.max_participants && challenge.participant_count >= challenge.max_participants) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '챌린지 참가 인원이 가득 찼습니다.'
        });
      }

      const [participant, created] = await db.ChallengeParticipant.findOrCreate({
        where: { challenge_id: id, user_id },
        transaction
      });

      if (!created) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '이미 이 챌린지에 참여 중입니다.'
        });
      }

      await challenge.increment('participant_count', { transaction });

      // 챌린지 생성자에게 알림 전송
      if (challenge.creator_id !== user_id) {
        await db.Notification.create({
          user_id: challenge.creator_id,
          content: `새로운 참가자가 "${challenge.title}" 챌린지에 참여했습니다.`,
          notification_type: 'challenge',
          related_id: challenge.challenge_id
        }, { transaction });
      }

      await transaction.commit();
      res.json({
        status: 'success',
        message: "챌린지에 성공적으로 참여했습니다."
      });
    } catch (error) {
      await transaction.rollback();
      console.error('챌린지 참여 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '챌린지 참여 중 오류가 발생했습니다.'
      });
    }
  },

  updateChallengeProgress: async (
    req: AuthRequest<ChallengeProgressBody, any, ChallengeParams>,
    res: Response
  ) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { progress_note, emotion_id } = req.body;
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (!progress_note || progress_note.length > 500) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '진행 상황 노트는 1자 이상 500자 이하여야 합니다.'
        });
      }

      const [participant, challenge] = await Promise.all([
        db.ChallengeParticipant.findOne({
          where: { challenge_id: id, user_id },
          transaction
        }),
        db.Challenge.findByPk(id, { transaction })
      ]);

      if (!participant) {
        await transaction.rollback();
        return res.status(403).json({
          status: 'error',
          message: '이 챌린지에 참여하지 않았습니다.'
        });
      }

      if (!challenge) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
      }

      const now = new Date();
      if (challenge.end_date < now || challenge.start_date > now) {
        await transaction.rollback();
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

      const existingLog = await db.ChallengeEmotion.findOne({
        where: {
          challenge_id: id,
          user_id,
          log_date: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
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

      const challengeEmotion = await db.ChallengeEmotion.create({
        challenge_id: id,
        user_id,
        emotion_id,
        log_date: now,
        note: progress_note
      }, { transaction });

      await transaction.commit();
      res.json({
        status: 'success',
        message: "챌린지 진행 상황이 성공적으로 업데이트되었습니다.",
        data: {
          emotion_log_id: challengeEmotion.challenge_emotion_id
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('챌린지 진행 상황 업데이트 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '챌린지 진행 상황 업데이트 중 오류가 발생했습니다.'
      });
    }
  }
};

export default challengeController;