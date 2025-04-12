import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric } from '../types/express';

const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// 요청 인터페이스
interface ChallengeQuery {
  page?: string;
  limit?: string;
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
  progress_note?: string;
}

interface ChallengeParams {
  id: string;
}

const challengeController = {
  createChallenge: async (req: AuthRequestGeneric<CreateChallengeBody>, res: Response) => {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      const { 
        title, 
        description, 
        start_date, 
        end_date, 
        is_public = true,
        max_participants
      } = req.body;

      console.log('챌린지 생성 요청:', { 
        title,
        start_date,
        end_date,
        is_public,
        user: req.user
      });

      const user_id = req.user?.user_id;

      if (!user_id) {
        await transaction.rollback();
        console.log('인증 실패: 사용자 ID 없음');
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      // 날짜 유효성 검사
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        await transaction.rollback();
        console.log('날짜 형식 오류:', { start_date, end_date });
        return res.status(400).json({
          status: 'error',
          message: '유효하지 않은 날짜 형식입니다.'
        });
      }

      if (startDate >= endDate) {
        await transaction.rollback();
        console.log('날짜 검증 실패: 시작일이 종료일보다 늦음');
        return res.status(400).json({
          status: 'error',
          message: '시작일은 종료일보다 이전이어야 합니다.'
        });
      }

      // 사용자 존재 확인
      const userCheck = await db.User.findByPk(user_id, { transaction });
      if (!userCheck) {
        await transaction.rollback();
        console.log(`사용자 확인 실패: ID ${user_id}를 찾을 수 없음`);
        return res.status(404).json({
          status: 'error',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      console.log('챌린지 생성 시작');
      
      // 챌린지 생성
      const challenge = await db.Challenge.create({
        creator_id: user_id,
        title: title.trim(),
        description: description?.trim() || null,
        start_date: startDate,
        end_date: endDate,
        is_public,
        max_participants: max_participants || null,
        participant_count: 1,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      console.log(`챌린지 생성 완료, ID: ${challenge.get('challenge_id')}`);

      // 챌린지 참가자 등록 (생성자)
      console.log('챌린지 참가자 등록 시작');
      await db.ChallengeParticipant.create({
        challenge_id: challenge.get('challenge_id'),
        user_id,
        created_at: new Date()
      }, { transaction });

      console.log('챌린지 참가자 등록 완료');
      await transaction.commit();
      console.log('트랜잭션 커밋 완료');
      
      return res.status(201).json({
        status: 'success',
        message: "챌린지가 성공적으로 생성되었습니다.",
        data: {
          challenge_id: challenge.get('challenge_id')
        }  
      });
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      console.error('챌린지 생성 오류:', error);
      
      return res.status(500).json({
        status: 'error',
        message: '챌린지 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
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

      const challenges = await db.Challenge.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.ChallengeParticipant,
            as: 'challenge_participants',
            attributes: ['user_id', 'created_at']
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
            challengeParticipants.some((participant: any) => 
              participant.user_id === user_id)
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

  getPostDetails: async (
    req: AuthRequestGeneric<never, never, ChallengeParams>, 
    res: Response
  ) => {
    try {
      const user_id = req.user?.user_id;
      const challengeId = Number(req.params.id);

      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const challenge = await db.Challenge.findOne({
        where: { challenge_id: challengeId },
        include: [
          {
            model: db.User,
            as: 'creator',
            attributes: ['user_id', 'nickname']
          },
          {
            model: db.ChallengeParticipant,
            as: 'challenge_participants',
            attributes: ['user_id', 'created_at']
          }
        ]
      });

      if (!challenge) {
        return res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
      }

      const challengeParticipants = challenge.get('challenge_participants') || [];
      const isParticipated = Array.isArray(challengeParticipants) && 
        challengeParticipants.some((participant: any) => 
          participant.user_id === user_id);

      const formattedChallenge = {
        challenge_id: challenge.get('challenge_id'),
        title: challenge.get('title'),
        description: challenge.get('description'),
        creator: challenge.get('creator'),
        start_date: challenge.get('start_date'),
        end_date: challenge.get('end_date'),
        is_public: challenge.get('is_public'),
        participant_count: challenge.get('participant_count'),
        created_at: challenge.get('created_at'),
        is_participated: isParticipated
      };

      return res.json({
        status: 'success',
        data: formattedChallenge
      });
    } catch (error) {
      console.error('챌린지 상세 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '챌린지 상세 정보 조회 중 오류가 발생했습니다.'
      });
    }
  },

  leaveChallenge: async (
    req: AuthRequestGeneric<never, never, ChallengeParams>,
    res: Response
  ) => {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      const challengeId = parseInt(req.params.id, 10);
      const user_id = req.user?.user_id;
  
      if (!user_id) {
        if (transaction) await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
  
      const challenge = await db.Challenge.findOne({
        where: { challenge_id: challengeId },
        transaction
      });
  
      if (!challenge) {
        if (transaction) await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
      }
  
      const participant = await db.ChallengeParticipant.findOne({
        where: {
          challenge_id: challengeId,
          user_id
        },
        transaction
      });
  
      if (!participant) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '참가하지 않은 챌린지입니다.'
        });
      }
  
      await db.ChallengeParticipant.destroy({
        where: {
          challenge_id: challengeId,
          user_id
        },
        transaction
      });
      
      await challenge.decrement('participant_count', { transaction });
  
      await transaction.commit();
      return res.json({
        status: 'success',
        message: '챌린지에서 성공적으로 탈퇴했습니다.'
      });
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      console.error('챌린지 탈퇴 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '챌린지 탈퇴 중 오류가 발생했습니다.'
      });
    }
  },

  participateInChallenge: async (
    req: AuthRequestGeneric<never, never, ChallengeParams>,
    res: Response
  ) => {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      const challengeId = Number(req.params.id);
      const user_id = req.user?.user_id;
  
      console.log('파라미터 정보:', { 
        challengeId, 
        user_id, 
        userType: typeof user_id,
        reqUser: JSON.stringify(req.user) 
      });
  
      if (!user_id) {
        if (transaction) await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
  
      // 챌린지 존재 여부 확인
      const challenge = await db.Challenge.findOne({
        where: { challenge_id: challengeId },
        transaction
      });
  
      if (!challenge) {
        if (transaction) await transaction.rollback();
        console.error('챌린지를 찾을 수 없음:', { challengeId });
        return res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
      }
  
      // 이미 참여한 챌린지 체크
      const existingParticipant = await db.ChallengeParticipant.findOne({
        where: { 
          challenge_id: challengeId,
          user_id: user_id 
        },
        transaction
      });
  
      if (existingParticipant) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '이미 참가 중인 챌린지입니다.'
        });
      }
  
      // 챌린지 생성자 체크 
      if (challenge.get('creator_id') === user_id) {
        if (transaction) await transaction.rollback();
        return res.status(200).json({
          status: 'success',
          message: '챌린지에 성공적으로 참가했습니다.',
          data: { 
            participant: {
              challenge_id: challengeId,
              user_id: user_id,
              created_at: new Date()
            }
          }
        });
      }
  
      // 최대 참가자 수 체크
      const maxParticipants = challenge.get('max_participants');
      const currentParticipants = challenge.get('participant_count');
  
      console.log('참가자 정보:', { 
        maxParticipants, 
        currentParticipants 
      });
  
      if (maxParticipants && currentParticipants >= maxParticipants) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '참가자 수가 초과되었습니다.'
        });
      }
  
      // 챌린지 참가자 생성
      const newParticipant = await db.ChallengeParticipant.create({
        challenge_id: challengeId,
        user_id: user_id,
        created_at: new Date()
      }, { transaction });
  
      // 참가자 수 증가
      await challenge.increment('participant_count', { transaction });
  
      await transaction.commit();
      return res.status(200).json({
        status: 'success',
        message: '챌린지에 성공적으로 참가했습니다.',
        data: {
          participant: newParticipant.get()
        }
      });
  
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      console.error('챌린지 참가 전체 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '챌린지 참가 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  },

  updateChallengeProgress: async (
    req: AuthRequestGeneric<ChallengeProgressBody, any, ChallengeParams>,
    res: Response
  ) => {
    console.log('진행 상황 업데이트 요청 데이터:', {
      body: req.body,
      params: req.params,
      user: req.user
    });
    
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      const { progress_note, emotion_id } = req.body;
      const challengeId = Number(req.params.id);
      const user_id = req.user?.user_id;

      if (!user_id) {
        if (transaction) await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      // 챌린지 참가 여부 확인
      const participant = await db.ChallengeParticipant.findOne({
        where: { 
          challenge_id: challengeId,
          user_id: user_id 
        },
        transaction
      });

      if (!participant) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '참가하지 않은 챌린지입니다.'
        });
      }

      // 감정 존재 여부 확인
      const emotion = await db.Emotion.findOne({
        where: { emotion_id: emotion_id },
        transaction
      });

      if (!emotion) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '유효하지 않은 감정입니다.'
        });
      }

      // 오늘 이미 기록했는지 확인
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const existingLog = await db.ChallengeEmotion.findOne({
        where: {
          challenge_id: challengeId,
          user_id: user_id,
          log_date: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        transaction
      });

      if (existingLog) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '오늘은 이미 진행 상황을 기록했습니다.'
        });
      }

      // ChallengeEmotion 로그 생성
      const emotionLog = await db.ChallengeEmotion.create({
        challenge_id: challengeId,
        user_id: user_id,
        emotion_id: emotion_id,
        log_date: today,
        note: progress_note ?? undefined,
        created_at: new Date()
      }, { transaction });
      
      await transaction.commit();
      return res.json({
        status: 'success',
        message: '진행 상황이 기록되었습니다.',
        data: {
          challenge_emotion_id: emotionLog.get('challenge_emotion_id'),
          challenge_id: challengeId,
          user_id: user_id,
          emotion_id: emotion_id,
          note: progress_note
        }
      });
    
    } catch (error: unknown) {
      if (transaction) {
        await transaction.rollback();
      }
      
      // 타입 가드를 통해 안전하게 에러 처리
      if (error instanceof Error) {
        console.error('진행 상황 기록 오류:', error);
      } else {
        console.error('알 수 없는 오류 발생:', error);
      }
      
      return res.status(500).json({
        status: 'error',
        message: '진행 상황 기록 중 오류가 발생했습니다.',
        errorDetails: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
};

export default challengeController;