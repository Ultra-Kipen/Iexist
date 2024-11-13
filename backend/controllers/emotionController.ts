import { Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric } from '../types/express';
import { Emotion } from '../models/Emotion';  // Emotion 모델 직접 임포트

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
        attributes: ['emotion_id', 'name', 'icon', 'color'],
        order: [['name', 'ASC']]
      });

      if (emotions.length === 0) {
        const defaultEmotions = [
          { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
          { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
          { emotion_id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB' },
          { emotion_id: 4, name: '감동', icon: 'heart-outline', color: '#FF6347' },
          { emotion_id: 5, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4' },
          { emotion_id: 6, name: '불안', icon: 'alert-outline', color: '#DDA0DD' },
          { emotion_id: 7, name: '화남', icon: 'emoticon-angry-outline', color: '#FF4500' },
          { emotion_id: 8, name: '지침', icon: 'emoticon-neutral-outline', color: '#A9A9A9' },
          { emotion_id: 9, name: '우울', icon: 'weather-cloudy', color: '#708090' },
          { emotion_id: 10, name: '고독', icon: 'account-outline', color: '#8B4513' },
          { emotion_id: 11, name: '충격', icon: 'lightning-bolt', color: '#9932CC' },
          { emotion_id: 12, name: '편함', icon: 'sofa-outline', color: '#32CD32' }
        ];

        await db.sequelize.models.emotions.bulkCreate(defaultEmotions, {
          ignoreDuplicates: true // emotion_id가 이미 존재할 경우 무시
        });
        
        return res.json({
          status: 'success',
          data: defaultEmotions
        });
      }

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

      const existingLog = await db.EmotionLog.findOne({
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
 const validEmotions = await db.Emotion.findAll({
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

// SQL 테이블과 일치하도록 create 쿼리 수정
const emotionLogs = await Promise.all(
  emotion_ids.map(async emotion_id => {
    const [result] = await db.sequelize.query(
      `INSERT INTO emotion_logs 
       (user_id, emotion_id, log_date, note, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [
          user_id,
          emotion_id,
          today,
          note?.trim() || null
        ],
        type: QueryTypes.INSERT,
        transaction
      }
    );

    return {
      log_id: result,
      emotion_id: emotion_id,
      log_date: today,
      note: note?.trim() || null
    };
  })
);

await transaction.commit();
return res.status(201).json({
  status: 'success',
  message: "감정이 성공적으로 기록되었습니다.",
  data: emotionLogs
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
    
    if (!start_date || !end_date) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: '시작 날짜와 종료 날짜를 모두 입력해주세요.'
      });
    }
    
 // 날짜 유효성 검사
 const startDateObj = new Date(start_date);
 const endDateObj = new Date(end_date);
 
 if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
   await transaction.rollback();
   return res.status(400).json({
     status: 'error',
     message: '유효한 날짜 형식이 아닙니다.'
   });
 }

 // 날짜 정규화
 const startDate = normalizeDate(startDateObj);
 const endDate = new Date(endDateObj.setHours(23, 59, 59, 999));

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