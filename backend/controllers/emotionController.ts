import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequest } from '../types/express';

interface EmotionStat {
  emotion: string;
  icon: string;
  count: number;
}

interface EmotionCreate {
  emotion_ids: number[];
  note?: string;
}

interface EmotionQuery {
  limit?: string;
  offset?: string;
}

interface EmotionTrendQuery {
  start_date: string;
  end_date: string;
  group_by?: 'day' | 'week' | 'month';
}

interface EmotionStatRecord {
  get(field: string): string | number;
}

// 헬퍼 함수들을 객체 외부에서 정의
function formatEmotionStats(stats: EmotionStatRecord[]): Record<string, EmotionStat[]> {
  return stats.reduce((acc: Record<string, EmotionStat[]>, curr) => {
    const date = curr.get('date') as string;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({
      emotion: curr.get('name') as string,
      icon: curr.get('icon') as string,
      count: parseInt(curr.get('count') as string)
    });
    return acc;
  }, {});
}

function formatEmotionTrend(trend: EmotionStatRecord[], groupBy: string): Record<string, EmotionStat[]> {
  return trend.reduce((acc: Record<string, EmotionStat[]>, curr) => {
    const date = curr.get('date') as string;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({
      emotion: curr.get('name') as string,
      icon: curr.get('icon') as string,
      count: parseInt(curr.get('count') as string)
    });
    return acc;
  }, {});
}

function getGroupByClause(groupBy: string) {
  switch (groupBy) {
    case 'week':
      return db.sequelize.fn('DATE_FORMAT', db.sequelize.col('log_date'), '%Y-%U');
    case 'month':
      return db.sequelize.fn('DATE_FORMAT', db.sequelize.col('log_date'), '%Y-%m');
    default:
      return db.sequelize.fn('DATE', db.sequelize.col('log_date'));
  }
}

const emotionController = {
  getAllEmotions: async (_req: Request, res: Response) => {
    try {
      const emotions = await db.Emotion.findAll({
        attributes: ['emotion_id', 'name', 'icon'],
        order: [['name', 'ASC']]
      });

      res.json({
        status: 'success',
        data: emotions
      });
    } catch (error) {
      console.error('감정 목록 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '감정 목록 조회 중 오류가 발생했습니다.'
      });
    }
  },

  getEmotions: async (req: AuthRequest<never, EmotionQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { limit = '30', offset = '0' } = req.query;

      const emotions = await db.EmotionLog.findAndCountAll({
        where: { user_id },
        include: [{
          model: db.Emotion,
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
    } catch (error) {
      console.error('감정 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '감정 조회 중 오류가 발생했습니다.'
      });
    }
  },

  createEmotion: async (req: AuthRequest<EmotionCreate>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { emotion_ids, note } = req.body;
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (!emotion_ids || !Array.isArray(emotion_ids) || emotion_ids.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '하나 이상의 감정을 선택해주세요.'
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingLog = await db.EmotionLog.findOne({
        where: {
          user_id,
          log_date: today
        },
        transaction
      });

      if (existingLog) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '오늘의 감정은 이미 기록되었습니다.'
        });
      }

      const emotionLogs = await Promise.all(
        emotion_ids.map(emotion_id =>
          db.EmotionLog.create({
            user_id,
            emotion_id,
            log_date: today,
            note
          }, { transaction })
        )
      );

      await transaction.commit();

      res.status(201).json({
        status: 'success',
        message: "감정이 성공적으로 기록되었습니다.",
        data: emotionLogs
      });
    } catch (error) {
      await transaction.rollback();
      console.error('감정 기록 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '감정 기록 중 오류가 발생했습니다.'
      });
    }
  },

  getEmotionStats: async (req: AuthRequest<never, EmotionTrendQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { start_date, end_date } = req.query;

      const stats = await db.EmotionLog.findAll({
        attributes: [
          [db.sequelize.fn('DATE', db.sequelize.col('log_date')), 'date'],
          'Emotion.name',
          'Emotion.icon',
          [db.sequelize.fn('COUNT', db.sequelize.col('EmotionLog.emotion_id')), 'count']
        ],
        include: [{
          model: db.Emotion,
          attributes: []
        }],
        where: {
          user_id,
          log_date: {
            [Op.between]: [start_date, end_date]
          }
        },
        group: [
          db.sequelize.fn('DATE', db.sequelize.col('log_date')),
          'Emotion.name',
          'Emotion.icon'
        ],
        order: [
          [db.sequelize.fn('DATE', db.sequelize.col('log_date')), 'ASC'],
          [db.sequelize.literal('count'), 'DESC']
        ]
      });

      const formattedStats = formatEmotionStats(stats as EmotionStatRecord[]);

      res.json({
        status: 'success',
        data: formattedStats
      });
    } catch (error) {
      console.error('감정 통계 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '감정 통계 조회 중 오류가 발생했습니다.'
      });
    }
  },

  getEmotionTrend: async (req: AuthRequest<never, EmotionTrendQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { start_date, end_date, group_by = 'day' } = req.query;

      const groupByClause = getGroupByClause(group_by);
      const trend = await db.EmotionLog.findAll({
        attributes: [
          [groupByClause, 'date'],
          'Emotion.name',
          'Emotion.icon',
          [db.sequelize.fn('COUNT', '*'), 'count']
        ],
        include: [{
          model: db.Emotion,
          attributes: []
        }],
        where: {
          user_id,
          log_date: { [Op.between]: [start_date, end_date] }
        },
        group: [groupByClause, 'Emotion.name', 'Emotion.icon'],
        order: [[groupByClause, 'ASC']]
      });

      const formattedTrend = formatEmotionTrend(trend as EmotionStatRecord[], group_by);

      res.json({
        status: 'success',
        data: formattedTrend
      });
    } catch (error) {
      console.error('감정 추세 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '감정 추세 조회 중 오류가 발생했습니다.'
      });
    }
  },

  getDailyEmotionCheck: async (req: AuthRequest, res: Response) => {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const check = await db.EmotionLog.findOne({
        where: {
          user_id,
          log_date: today
        },
        include: [{
          model: db.Emotion,
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
    } catch (error) {
      console.error('일일 감정 체크 확인 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '일일 감정 체크 확인 중 오류가 발생했습니다.'
      });
    }
  }
};

export default emotionController;