import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric } from '../types/express';
import { validateRequest, query } from '../middleware/validationMiddleware';

// 유틸리티 함수 추가
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};
interface StatsQuery {
  start_date?: string;
  end_date?: string;
  type?: 'daily' | 'weekly' | 'monthly';
}

interface EmotionStats {
  emotion_id: number;
  emotion_name: string;
  count: number;
  percentage: number;
}

// 통계 관련 validation rules
export const statsValidations = {
  getStats: [
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('end_date')
      .optional()
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('type')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('유효하지 않은 통계 타입입니다.')
  ]
};

const statsController = {
  getUserStats: async (req: AuthRequestGeneric<never, StatsQuery>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const user_id = req.user?.user_id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { start_date, end_date, type = 'daily' } = req.query;

      const whereClause: any = { user_id };
      if (start_date && end_date) {
        whereClause.log_date = {
          [Op.between]: [
            normalizeDate(new Date(start_date)),
            new Date(new Date(end_date).setHours(23, 59, 59, 999))
          ]
        };
      }

      // 기본 통계 조회
      const stats = await db.sequelize.models.user_stats.findOne({
        where: { user_id },
        attributes: [
          'my_day_post_count',
          'someone_day_post_count',
          'my_day_like_received_count',
          'someone_day_like_received_count', 
          'my_day_comment_received_count',
          'someone_day_comment_received_count',
          'challenge_count',
          'last_updated'
        ],
        transaction
      });

      if (!stats) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '통계 정보를 찾을 수 없습니다.'
        });
      }

      // 감정 통계 조회
      const emotionStats = await db.sequelize.models.emotion_logs.findAll({
        attributes: [
          'emotion_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('emotion_id')), 'count']
        ],
        include: [{
          model: db.sequelize.models.emotions,
          attributes: ['name'],
          required: true
        }],
        where: whereClause,
        group: ['emotion_id', 'emotions.name'],
        order: [[db.sequelize.literal('count'), 'DESC']],
        transaction
      });

 // 먼저 emotion stats를 계산하는 부분
const emotionCounts = emotionStats.map(stat => Number(stat.get('count')));
const totalEmotions = emotionCounts.reduce((sum, count) => sum + count, 0);

// 그 다음 포맷팅
const formattedEmotionStats: EmotionStats[] = emotionStats.map(stat => {
  const count = Number(stat.dataValues.count);
  return {
    emotion_id: Number(stat.dataValues.emotion_id),
    emotion_name: stat.dataValues.emotions?.name,
    count: count,
    percentage: Number(((count / (totalEmotions || 1)) * 100).toFixed(1))
  };
});
      await transaction.commit();
      return res.json({
        status: 'success',
        data: {
          basic_stats: stats.get(),
          emotion_stats: formattedEmotionStats,
          period: {
            type,
            start_date: start_date ? normalizeDate(new Date(start_date)).toISOString() : null,
            end_date: end_date ? new Date(new Date(end_date).setHours(23, 59, 59, 999)).toISOString() : null
          }
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('사용자 통계 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '사용자 통계 조회 중 오류가 발생했습니다.'
      });
    }
  },

  getEmotionTrends: async (req: AuthRequestGeneric<never, StatsQuery>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const user_id = req.user?.user_id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { start_date, end_date, type = 'daily' } = req.query;

      const whereClause: any = { user_id };
      if (start_date && end_date) {
        whereClause.log_date = {
          [Op.between]: [
            normalizeDate(new Date(start_date)),
            new Date(new Date(end_date).setHours(23, 59, 59, 999))
          ]
        };
      }

      const groupByClause = type === 'daily' 
        ? 'DATE(log_date)' 
        : type === 'weekly' 
          ? 'YEARWEEK(log_date)' 
          : 'DATE_FORMAT(log_date, "%Y-%m")';

      const trends = await db.sequelize.models.emotion_logs.findAll({
        attributes: [
          [db.sequelize.fn(type === 'daily' ? 'DATE' : 'DATE_FORMAT', 
            db.sequelize.col('log_date'),
            type === 'weekly' ? '%Y-%u' : '%Y-%m-%d'
          ), 'date'],
          'emotion_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('emotion_id')), 'count']
        ],
        include: [{
          model: db.sequelize.models.emotions,
          attributes: ['name', 'icon'],
          required: true
        }],
        where: whereClause,
        group: [groupByClause, 'emotion_id', 'emotions.name', 'emotions.icon'],
        order: [[db.sequelize.col('date'), 'ASC']],
        transaction
      });

      await transaction.commit();
      return res.json({
        status: 'success',
        data: {
          trends: trends.map(trend => trend.get()),
          period: {
            type,
            start_date: start_date ? normalizeDate(new Date(start_date)).toISOString() : null,
            end_date: end_date ? new Date(new Date(end_date).setHours(23, 59, 59, 999)).toISOString() : null
          }
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('감정 트렌드 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '감정 트렌드 조회 중 오류가 발생했습니다.'
      });
    }
  }
};
export default statsController;