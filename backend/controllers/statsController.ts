import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequest } from '../types/express';

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

const statsController = {
  getUserStats: async (req: AuthRequest<never, StatsQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { start_date, end_date, type = 'daily' } = req.query;

      const whereClause: any = { user_id };
      if (start_date && end_date) {
        whereClause.last_updated = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      const stats = await db.UserStats.findOne({ 
        where: whereClause,
        attributes: [
          'user_id',
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
          attributes: ['name']
        }],
        where: {
          user_id,
          ...(start_date && end_date ? {
            log_date: {
              [Op.between]: [start_date, end_date]
            }
          } : {})
        },
        group: ['emotion_id', 'Emotion.name'],
        order: [[db.sequelize.literal('count'), 'DESC']]
      });

      const totalEmotions = emotionStats.reduce((sum, stat) => sum + Number(stat.getDataValue('count')), 0);
      
      const formattedEmotionStats: EmotionStats[] = emotionStats.map(stat => ({
        emotion_id: stat.emotion_id,
        emotion_name: stat.Emotion.name,
        count: Number(stat.getDataValue('count')),
        percentage: Number(((Number(stat.getDataValue('count')) / totalEmotions) * 100).toFixed(1))
      }));

      res.json({
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
      res.status(500).json({
        status: 'error',
        message: '사용자 통계 조회 중 오류가 발생했습니다.'
      });
    }
  },

  updateUserStats: async (req: AuthRequest, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      // 게시물 수 집계
      const [
        myDayPostCount,
        someoneDayPostCount,
        myDayLikeCount,
        someoneDayLikeCount,
        myDayCommentCount,
        someoneDayCommentCount,
        challengeCount
      ] = await Promise.all([
        db.MyDayPost.count({
          where: { user_id },
          transaction
        }),
        db.SomeoneDayPost.count({
          where: { user_id },
          transaction
        }),
        db.MyDayLike.count({
          include: [{
            model: db.MyDayPost,
            where: { user_id }
          }],
          transaction
        }),
        db.SomeoneDayLike.count({
          include: [{
            model: db.SomeoneDayPost,
            where: { user_id }
          }],
          transaction
        }),
        db.MyDayComment.count({
          include: [{
            model: db.MyDayPost,
            where: { user_id }
          }],
          transaction
        }),
        db.EncouragementMessage.count({
          include: [{
            model: db.SomeoneDayPost,
            where: { user_id }
          }],
          transaction
        }),
        db.ChallengeParticipant.count({
          where: { 
            user_id,
            joined_at: {
              [Op.lte]: new Date()
            }
          },
          transaction
        })
      ]);

      const [stats] = await db.UserStats.upsert({
        user_id,
        my_day_post_count: myDayPostCount,
        someone_day_post_count: someoneDayPostCount,
        my_day_like_received_count: myDayLikeCount,
        someone_day_like_received_count: someoneDayLikeCount,
        my_day_comment_received_count: myDayCommentCount,
        someone_day_comment_received_count: someoneDayCommentCount,
        challenge_count: challengeCount
      }, { transaction });

      await transaction.commit();
      res.json({
        status: 'success',
        message: '통계가 성공적으로 업데이트되었습니다.',
        data: { stats }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('사용자 통계 업데이트 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '사용자 통계 업데이트 중 오류가 발생했습니다.'
      });
    }
  },

  getEmotionTrends: async (req: AuthRequest<never, StatsQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;

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
          [Op.between]: [start_date, end_date]
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
          attributes: ['name', 'icon']
        }],
        where: whereClause,
        group: [groupByClause, 'emotion_id', 'Emotion.name', 'Emotion.icon'],
        order: [[db.sequelize.col('date'), 'ASC']]
      });

      res.json({
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
      res.status(500).json({
        status: 'error',
        message: '감정 트렌드 조회 중 오류가 발생했습니다.'
      });
    }
  }
};

export default statsController;