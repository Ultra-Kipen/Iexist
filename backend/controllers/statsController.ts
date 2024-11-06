import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric } from '../types/express';
import { validateRequest, query } from '../middleware/validationMiddleware';

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
    try {
      const user_id = req.user?.user_id;

      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { start_date, end_date, type = 'daily' } = req.query;

      const whereClause: any = { user_id };
      if (start_date && end_date) {
        whereClause.log_date = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      // 기본 통계 조회
      const stats = await db.sequelize.models.user_stats.findOne({ // UserStats -> user_stats로 수정
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
        ]
      });

      if (!stats) {
        return res.status(404).json({
          status: 'error',
          message: '통계 정보를 찾을 수 없습니다.'
        });
      }

      // 감정 통계 조회
      const emotionStats = await db.EmotionLog.findAll({
        attributes: [
          'emotion_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('emotion_id')), 'count']
        ],
        include: [{
          model: db.Emotion,
          attributes: ['name'],
          required: true
        }],
        where: whereClause,
        group: ['emotion_id', 'Emotion.name'],
        order: [[db.sequelize.literal('count'), 'DESC']]
      });

      const totalEmotions = emotionStats.reduce((sum, stat: any) => 
        sum + Number(stat.dataValues.count), 0);
      
      const formattedEmotionStats: EmotionStats[] = emotionStats.map((stat: any) => ({
        emotion_id: stat.emotion_id,
        emotion_name: stat.get('Emotion').name,
        count: Number(stat.dataValues.count),
        percentage: Number(((Number(stat.dataValues.count) / totalEmotions * 100)).toFixed(1))
      }));

      return res.json({
        status: 'success',
        data: {
          basic_stats: stats,
          emotion_stats: formattedEmotionStats,
          period: {
            type,
            start_date,
            end_date
          }
        }
      });
    } catch (error) {
      console.error('사용자 통계 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '사용자 통계 조회 중 오류가 발생했습니다.'
      });
    }
  },

  getEmotionTrends: async (req: AuthRequestGeneric<never, StatsQuery>, res: Response) => {
    try {
      const user_id = req.user?.user_id;

      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { start_date, end_date, type = 'daily' } = req.query;

      const whereClause: any = { user_id };
      if (start_date && end_date) {
        whereClause.log_date = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      const groupByClause = type === 'daily' 
        ? 'DATE(log_date)' 
        : type === 'weekly' 
          ? 'YEARWEEK(log_date)' 
          : 'DATE_FORMAT(log_date, "%Y-%m")';

      const trends = await db.EmotionLog.findAll({
        attributes: [
          [db.sequelize.fn(type === 'daily' ? 'DATE' : 'DATE_FORMAT', 
            db.sequelize.col('log_date'),
            type === 'weekly' ? '%Y-%u' : '%Y-%m-%d'
          ), 'date'],
          'emotion_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('emotion_id')), 'count']
        ],
        include: [{
          model: db.Emotion,
          attributes: ['name', 'icon'],
          required: true
        }],
        where: whereClause,
        group: [groupByClause, 'emotion_id', 'Emotion.name', 'Emotion.icon'],
        order: [[db.sequelize.col('date'), 'ASC']]
      });

      return res.json({
        status: 'success',
        data: {
          trends,
          period: {
            type,
            start_date,
            end_date
          }
        }
      });
    } catch (error) {
      console.error('감정 트렌드 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '감정 트렌드 조회 중 오류가 발생했습니다.'
      });
    }
  }
};

export default statsController;