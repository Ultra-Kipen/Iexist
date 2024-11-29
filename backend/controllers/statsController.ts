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
      const stats = await db.UserStats.findOne({
        attributes: ['user_id'], // specify the columns you need
        where: {},
        include: [
          {
            model: db.User,
            as: 'user',
            where: { user_id }
          }
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
  
      await transaction.commit();
      return res.json({
        status: 'success',
        data: stats
      });
  
    } catch (error) {
      await transaction.rollback();
      console.error('사용자 통계 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '통계 조회 중 오류가 발생했습니다.'
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

      const dateFormat = type === 'daily' 
        ? '%Y-%m-%d'
        : type === 'weekly' 
          ? '%Y-%u'
          : '%Y-%m';

      const trends = await db.EmotionLog.findAll({
        attributes: [
          [db.sequelize.fn('DATE_FORMAT',
            db.sequelize.col('log_date'),
            type === 'weekly' ? '%Y-%u' : type === 'monthly' ? '%Y-%m' : '%Y-%m-%d'
          ), 'date'],
          [db.sequelize.col('EmotionLog.emotion_id'), 'emotion_id'],
          [db.sequelize.fn('COUNT', db.sequelize.col('EmotionLog.emotion_id')), 'count']
        ],
        include: [{
          model: db.Emotion,
          as: 'emotion',
          attributes: ['name', 'icon'],
          required: true
        }],
        where: whereClause,
        group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('log_date'), dateFormat), 'emotion_id', 'emotion.name', 'emotion.icon'],
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