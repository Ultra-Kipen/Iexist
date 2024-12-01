import { Response } from 'express';
import { 
  Op, 
  Model, 
  IncrementDecrementOptions, 
  CreateOptions, 
  BelongsToManyAddAssociationsMixin,
  FindAndCountOptions,
  QueryTypes 
} from 'sequelize';
import db from '../models';
import { AuthRequest, AuthRequestGeneric } from '../types/express';
import { Emotion, EmotionAttributes } from '../models/Emotion';

// 인터페이스 정의
interface MyDayPostAttributes {
  post_id: number;
  user_id: number;
  content: string;
  emotion_summary: string | null;
  image_url: string | null;
  is_anonymous: boolean;
  character_count: number;
  like_count: number;
  comment_count: number;
  created_at: Date;
  updated_at: Date;
}

interface MyDayPost {
  content: string;
  emotion_summary?: string;
  image_url?: string;
  is_anonymous?: boolean;
  emotion_ids?: number[];
}

interface MyDayQuery {
  page?: string;
  limit?: string;
  emotion?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'latest' | 'popular';
}

interface MyDayComment {
  content: string;
  is_anonymous?: boolean;
}

interface PostParams {
  id: string;
}

interface EmotionInstance extends Model<EmotionAttributes>, EmotionAttributes {}
interface MyDayPostInstance extends Model<MyDayPostAttributes, MyDayPostAttributes> {
  post_id: number;
  user_id: number;
}

// MyDayPost 모델 임포트
import MyDayPostModel from '../models/MyDayPost'; // 경로와 모델 이름이 올바른지 확인

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

export const emotionController = {
  getAllEmotions: async (req: AuthRequestGeneric<never>, res: Response) => {
    try {
      const emotions = await db.Emotion.findAll({
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
        data: emotions
      });
    } catch (error) {
      console.error('감정 목록 조회 오류:', error);
      return res.status(500).json({
        status: 'error', 
        message: '감정 목록 조회 중 오류가 발생했습니다.'
      });
    }
  },
  getEmotionStats: async (
    req: AuthRequestGeneric<never, { start_date?: string; end_date?: string }>, 
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
  
      const { start_date, end_date } = req.query;
      
      // 날짜가 없으면 최근 7일간의 데이터 조회
      const endDate = end_date ? new Date(end_date) : new Date();
      const startDate = start_date ? new Date(start_date) : new Date(endDate);
      
      if (!start_date) {
        startDate.setDate(startDate.getDate() - 7);
      }
  
      const stats = await db.sequelize.query(`
        SELECT 
          DATE(el.log_date) as date,
          e.name,
          e.icon, 
          COUNT(*) as count
        FROM emotion_logs el
        INNER JOIN emotions e ON el.emotion_id = e.emotion_id
        WHERE el.user_id = :user_id
          AND el.log_date BETWEEN :start_date AND :end_date
        GROUP BY DATE(el.log_date), e.name, e.icon
        ORDER BY date ASC, count DESC
      `, {
        replacements: {
          user_id,
          start_date: startDate, 
          end_date: endDate
        },
        type: QueryTypes.SELECT
      }) as EmotionStatRecord[];
  
      const formattedStats = formatEmotionStats(stats);
  
      return res.json({
        status: 'success',
        data: Object.values(formattedStats)
      });
  
    } catch (error) {
      console.error('감정 통계 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '감정 통계 조회 중 오류가 발생했습니다.'
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


        // 감정이 없는지 체크
        const emotions = await db.Emotion.findAll({
          attributes: ['emotion_id', 'name', 'icon', 'color'],
          transaction
      });

      if (emotions.length === 0) {
        // 기본 감정 데이터 삽입
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

        await db.Emotion.bulkCreate(defaultEmotions, {
          transaction
      });
  }
  if (!emotion_ids?.length) {
    await transaction.rollback();
    return res.status(400).json({
        status: 'error',
        message: '하나 이상의 감정을 선택해주세요.'
    });
}

const validEmotions = await db.Emotion.findAll({
  where: {
      emotion_id: emotion_ids
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

  // EmotionLog 생성 시 타입 제외
  const emotionLogs = await Promise.all(
    emotion_ids.map(emotion_id =>
        db.EmotionLog.create({
            user_id,
            emotion_id,
            log_date: new Date(),
            note: note?.trim() || null
        } as any, {  // as any로 타입 체크 우회
            transaction
        })
    )
);

await transaction.commit();
return res.status(201).json({
    status: 'success',
    message: "감정이 성공적으로 기록되었습니다.",
    data: emotionLogs.map(log => log.get())
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
getEmotionTrend: async (
  req: AuthRequestGeneric<never, EmotionTrendQuery>, 
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

    const { start_date, end_date, group_by = 'day' } = req.query;
    
    // 날짜가 없으면 최근 7일간의 데이터 조회
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date(endDate);
    
    if (!start_date) {
      startDate.setDate(startDate.getDate() - 7);
    }

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
      INNER JOIN emotions e ON el.emotion_id = e.emotion_id
      WHERE el.user_id = :user_id
        AND el.log_date BETWEEN :start_date AND :end_date
      GROUP BY ${dateFormat}, e.name, e.icon
      ORDER BY date ASC, count DESC
    `;

    const trend = await db.sequelize.query<EmotionStatRecord>(query, {
      replacements: { 
        user_id,
        start_date: startDate,
        end_date: endDate
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
  const user_id = req.user?.user_id;
  if (!user_id) {
    return res.status(401).json({
      status: 'error',
      message: '인증이 필요합니다.'
    });
  }

  const today = normalizeDate(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const check = await db.EmotionLog.findOne({
      where: {
        user_id,
        log_date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [{
        model: db.Emotion,
        as: 'emotion',
        attributes: ['name', 'icon'],
        required: true
      }],
      attributes: ['log_id', 'log_date', 'note']
    });

    return res.json({
      status: 'success',
      data: {
        hasDailyCheck: !!check,
        lastCheck: check?.get() 
      }
    });
  } catch (error) {
    console.error('일일 감정 체크 확인 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '일일 감정 체크 확인 중 오류가 발생했습니다.'
    });
  }
},
   

// createPost 함수 수정
createPost: async (req: AuthRequestGeneric<MyDayPost>, res: Response) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { content, emotion_summary, image_url, is_anonymous, emotion_ids } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }
    const validatedEmotionIds = await validateEmotionIds(emotion_ids, transaction);

    const post = await db.sequelize.models.my_day_posts.create({
      user_id,
      content,
      emotion_summary: emotion_summary || null,
      image_url: image_url || null,
      is_anonymous: is_anonymous || false,
      character_count: content.length,
      like_count: 0,
      comment_count: 0
    }, { transaction });

    if (validatedEmotionIds.length > 0) {
      await db.sequelize.models.my_day_emotions.bulkCreate(
        validatedEmotionIds.map(id => ({
          post_id: post.get('post_id'),
          emotion_id: id
        })),
        { transaction }
      );
    }

    await transaction.commit();
    return res.status(201).json({
      status: 'success',
      message: "오늘 하루의 기록이 성공적으로 저장되었습니다.",
      data: {
        post_id: post.get('post_id')
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('게시물 저장 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: (error instanceof Error ? error.message : '게시물 저장 중 오류가 발생했습니다.')
    });
  }
},

// getPost 함수 수정
getPost: async (req: AuthRequestGeneric<never, never, { id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const post = await db.sequelize.models.my_day_posts.findByPk(id, {
      include: [
        {
          model: db.sequelize.models.emotions,
          through: { attributes: [] },
          attributes: ['emotion_id', 'name', 'icon']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    return res.json({
      status: 'success',
      data: post
    });
  } catch (error) {
    console.error('게시물 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '게시물 조회 중 오류가 발생했습니다.'
    });
  }
}
};

// emotion_ids 유효성 검사 함수
const validateEmotionIds = async (emotion_ids: number[] | undefined, transaction: any): Promise<number[]> => {
  if (!emotion_ids || emotion_ids.length === 0) {
    return [];
  }

  const uniqueEmotionIds = [...new Set(emotion_ids)];
  const emotions = await db.sequelize.models.emotions.findAll({
    where: {
      emotion_id: uniqueEmotionIds
    },
    transaction
  });

  const foundEmotionIds = emotions.map(emotion => emotion.get('emotion_id'));
  const invalidEmotions = uniqueEmotionIds.filter(id => !foundEmotionIds.includes(id));

  if (invalidEmotions.length > 0) {
    throw new Error(`유효하지 않은 감정 ID: ${invalidEmotions.join(', ')}`);
  }

  return uniqueEmotionIds;
};

export default emotionController;