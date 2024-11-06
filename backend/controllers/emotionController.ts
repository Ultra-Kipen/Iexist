import { Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric } from '../types/express';

interface EmotionStat {
  date: string;
  emotions: Array<{
    name: string;
    icon: string;
    count: number;
  }>;
}

interface EmotionQuery {
  limit?: string;
  offset?: string;
}

interface EmotionTrendQuery {
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
}

interface EmotionStatRecord {
  date: string;
  name: string;
  icon: string;
  count: string | number;
}

function formatEmotionStats(stats: EmotionStatRecord[]): Record<string, EmotionStat> {
  return stats.reduce((acc: Record<string, EmotionStat>, curr) => {
    const { date, name, icon, count } = curr;
    if (!acc[date]) {
      acc[date] = { date, emotions: [] };
    }
    acc[date].emotions.push({
      name,
      icon,
      count: typeof count === 'string' ? parseInt(count) : count
    });
    return acc;
  }, {});
}

// 유틸리티 함수 추가
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const emotionController = {
  getAllEmotions: async (req: AuthRequestGeneric<never>, res: Response) => {
    try {
      const emotions = await db.sequelize.models.emotions.findAll({
        attributes: ['emotion_id', 'name', 'icon'],
        order: [['name', 'ASC']]
      });

      return res.json({
        status: 'success',
        data: emotions.map(emotion => emotion.get())
      });
    } catch (error) {
      console.error('감정 목록 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '감정 목록 조회 중 오류가 발생했습니다.'
      });
    }
  },

  getEmotions: async (req: AuthRequestGeneric<never, EmotionQuery>, res: Response) => {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { limit = '30', offset = '0' } = req.query;

      const emotions = await db.sequelize.models.emotion_logs.findAndCountAll({
        where: { user_id },
        include: [{
          model: db.sequelize.models.emotions,
          attributes: ['name', 'icon']
        }],
        order: [['log_date', 'DESC']],
        limit: Number(limit),
        offset: Number(offset),
        attributes: ['log_id', 'log_date', 'note']
      });

      return res.json({
        status: 'success',
        data: emotions.rows.map(emotion => emotion.get()),
        pagination: {
          total: emotions.count,
          limit: Number(limit),
          offset: Number(offset),
          total_pages: Math.ceil(emotions.count / Number(limit))
        }
      });
    } catch (error) {
      console.error('감정 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '감정 조회 중 오류가 발생했습니다.'
      });
    }
  },

  createEmotion: async (
    req: AuthRequestGeneric<{ emotion_ids: number[]; note?: string }>,
    res: Response
  ) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { emotion_ids, note } = req.body;
      const user_id = req.user?.user_id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (!emotion_ids?.length) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '하나 이상의 감정을 선택해주세요.'
        });
      }

      const today = normalizeDate(new Date());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const existingLog = await db.sequelize.models.emotion_logs.findOne({
        where: {
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
          message: '오늘의 감정은 이미 기록되었습니다.'
        });
      }
 // 감정 ID 유효성 검증
 const validEmotions = await db.sequelize.models.emotions.findAll({
  where: {
    emotion_id: {
      [Op.in]: emotion_ids
    }
  },
  transaction
});

if (validEmotions.length !== emotion_ids.length) {
  await transaction.rollback();
  return res.status(400).json({
    status: 'error',
    message: '유효하지 않은 감정이 포함되어 있습니다.'
  });
}

const emotionLogs = await Promise.all(
  emotion_ids.map(emotion_id =>
    db.sequelize.models.emotion_logs.create({
      user_id,
      emotion_id,
      log_date: today,
      note: note?.trim() || null
    }, { transaction })
  )
);

await transaction.commit();
return res.status(201).json({
  status: 'success',
  message: "감정이 성공적으로 기록되었습니다.",
  data: emotionLogs.map(log => ({
    log_id: log.get('log_id'),
    emotion_id: log.get('emotion_id'),
    log_date: log.get('log_date'),
    note: log.get('note')
  }))
});
} catch (error) {
await transaction.rollback();
console.error('감정 기록 오류:', error);
return res.status(500).json({
  status: 'error',
  message: '감정 기록 중 오류가 발생했습니다.'
});
}
},

getEmotionStats: async (
  req: AuthRequestGeneric<never, { start_date?: string; end_date?: string }>,
  res: Response
) => {
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
    const { start_date, end_date } = req.query;
    
    // 날짜 정규화
    const startDate = start_date ? normalizeDate(new Date(start_date)) : normalizeDate(new Date());
    const endDate = end_date 
      ? new Date(new Date(end_date).setHours(23, 59, 59, 999))
      : new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);

    const query = `
      SELECT 
        DATE(el.log_date) as date,
        e.name,
        e.icon,
        COUNT(*) as count
      FROM emotion_logs el
      JOIN emotions e ON el.emotion_id = e.emotion_id
      WHERE el.user_id = :user_id
        AND el.log_date BETWEEN :start_date AND :end_date
      GROUP BY DATE(el.log_date), e.name, e.icon
      ORDER BY date ASC, count DESC
    `;

    const stats = await db.sequelize.query<EmotionStatRecord>(query, {
      replacements: { 
        user_id, 
        start_date: startDate, 
        end_date: endDate 
      },
      type: QueryTypes.SELECT,
      transaction
    });

    const formattedStats = formatEmotionStats(stats);

    await transaction.commit();
    return res.json({
      status: 'success',
      data: Object.values(formattedStats)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('감정 통계 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '감정 통계 조회 중 오류가 발생했습니다.'
    });
  }
},

  getEmotionTrend: async (req: AuthRequestGeneric<never, EmotionTrendQuery>, res: Response) => {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { start_date, end_date, group_by = 'day' } = req.query;

      const dateFormat = group_by === 'week' 
        ? 'DATE_FORMAT(el.log_date, "%Y-%u")'
        : group_by === 'month'
          ? 'DATE_FORMAT(el.log_date, "%Y-%m")'
          : 'DATE(el.log_date)';

      const query = `
        SELECT 
          ${dateFormat} as date,
          e.name,
          e.icon,
          COUNT(*) as count
        FROM emotion_logs el
        JOIN emotions e ON el.emotion_id = e.emotion_id
        WHERE el.user_id = :user_id
          AND el.log_date BETWEEN :start_date AND :end_date
        GROUP BY ${dateFormat}, e.name, e.icon
        ORDER BY date ASC, count DESC
      `;

      const trend = await db.sequelize.query<EmotionStatRecord>(query, {
        replacements: { 
          user_id, 
          start_date: start_date || new Date(), 
          end_date: end_date || new Date() 
        },
        type: QueryTypes.SELECT
      });

      const formattedTrend = formatEmotionStats(trend);

      return res.json({
        status: 'success',
        data: Object.values(formattedTrend)
      });
    } catch (error) {
      console.error('감정 추세 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '감정 추세 조회 중 오류가 발생했습니다.'
      });
    }
  },

  getDailyEmotionCheck: async (req: AuthRequestGeneric<never>, res: Response) => {
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
      const today = normalizeDate(new Date());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
      const check = await db.sequelize.models.emotion_logs.findOne({
        where: {
          user_id,
          log_date: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        include: [{
          model: db.sequelize.models.emotions,
          attributes: ['name', 'icon']
        }],
        transaction
      });
  
      await transaction.commit();

      return res.json({
        status: 'success',
        data: {
          hasDailyCheck: !!check,
          lastCheck: check ? check.get() : null
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('일일 감정 체크 확인 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '일일 감정 체크 확인 중 오류가 발생했습니다.'
      });
    }
  }
};

export default emotionController;