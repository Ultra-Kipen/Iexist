import { Response } from 'express';
import { 
  Op, 
  Model, 
  IncrementDecrementOptions, 
  CreateOptions, 
  BelongsToManyAddAssociationsMixin,
  FindAndCountOptions
} from 'sequelize';
import db from '../models';
import { AuthRequest, AuthRequestGeneric } from '../types/express';
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
// 모델 인터페이스
interface MyDayPostInstance extends Model<MyDayPostAttributes, MyDayPostAttributes> {
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

  // Sequelize 관련 메서드들
  addEmotions: BelongsToManyAddAssociationsMixin<EmotionInstance, number>;
  getUser: () => Promise<Model<UserAttributes>>;
  getEmotions: () => Promise<EmotionInstance[]>;
  getMyDayComments: () => Promise<Model<MyDayCommentAttributes>[]>;

  // increment/decrement 메서드
  increment: <K extends keyof MyDayPostAttributes>(
    fields: K | readonly K[] | Partial<MyDayPostAttributes>,
    options?: IncrementDecrementOptions
  ) => Promise<this>;
  
  decrement: <K extends keyof MyDayPostAttributes>(
    fields: K | readonly K[] | Partial<MyDayPostAttributes>,
    options?: IncrementDecrementOptions
  ) => Promise<this>;
  // dataValues 정의
  dataValues: MyDayPostAttributes & {
    User?: UserAttributes;
    Emotions?: EmotionAttributes[];
    MyDayComments?: MyDayCommentAttributes[];
  };
}


// JSON 변환 결과 인터페이스 추가
interface MyDayPostJSON {
  post_id: number;
  user_id: number;
  content: string;
  emotion_summary?: string;
  image_url?: string;
  is_anonymous: boolean;
  character_count: number;
  like_count: number;
  comment_count: number;
  created_at: Date;
  updated_at: Date;
  User?: UserAttributes;
  Emotions?: EmotionAttributes[];
  MyDayComments?: MyDayCommentAttributes[];
}
// 조회 시 사용할 where절 타입 정의
interface WhereClause {
  [key: string]: any;
  created_at?: {
    [Op.between]: [Date, Date];
  };
  '$Emotions.name$'?: string;
}

// 추가 인터페이스 정의
interface UserAttributes {
  user_id: number;
  username: string;
  email: string;
  nickname: string | null;
  profile_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

interface EmotionAttributes {
  emotion_id: number;
  name: string;
  icon: string;
}

interface MyDayCommentAttributes {
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  is_anonymous: boolean;
  created_at: Date;
  User?: {
    nickname: string;
    profile_image_url: string | null;
  };
}
interface MyDayLikeAttributes {
  user_id: number;
  post_id: number;
  created_at: Date;
}

// 5. Controller에서 사용할 타입들 수정
interface MyDayPostCreateInput {
  content: string;
  emotion_summary?: string;
  image_url?: string;
  is_anonymous?: boolean;
  emotion_ids?: number[];
}
interface FindAndCountResult<T> {
  rows: T[];
  count: number;
}
// getPosts 메서드에서 사용할 타입 정의
type OrderClause = [
  ['like_count' | 'comment_count' | 'created_at', 'DESC'],
  ...['comment_count' | 'created_at', 'DESC'][]
];


// 유틸리티 함수
const checkAuth = (userId: number | undefined): boolean => {
  return userId !== undefined;
};

const validateContent = (content: string | undefined | null, minLength: number, maxLength: number): boolean => {
  if (typeof content !== 'string') return false;
  return content.length >= minLength && content.length <= maxLength;
};

const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { start: today, end: tomorrow };
};

const formatPaginationData = (count: number, page: number, limit: number, offset: number) => ({
  current_page: page,
  total_pages: Math.ceil(count / limit),
  total_count: count,
  has_next: offset + limit < count
});

const myDayController = {
  createPost: async (req: AuthRequestGeneric<MyDayPost>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { content, emotion_summary, image_url, is_anonymous, emotion_ids } = req.body;
      const user_id = req.user?.user_id;

      if (!checkAuth(user_id)) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (!validateContent(content, 10, 1000)) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '게시물 내용은 10자 이상 1000자 이하여야 합니다.'
        });
      }

      const { start, end } = getTodayRange();
      const existingPost = await db.sequelize.models.my_day_posts.findOne({
        where: {
          user_id,
          created_at: {
            [Op.gte]: start,
            [Op.lt]: end
          }
        },
        transaction
      });

      if (existingPost) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '오늘의 게시물은 이미 작성되었습니다.'
        });
      }

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
      
      if (emotion_ids?.length) {
        const emotions = await db.sequelize.models.emotions.findAll({
          where: { emotion_id: { [Op.in]: emotion_ids } },
          transaction
        });
      
        if (emotions.length !== emotion_ids.length) {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: '유효하지 않은 감정이 포함되어 있습니다.'
          });
        }
      
          await db.sequelize.models.my_day_emotions.bulkCreate(
          emotion_ids.map(emotion_id => ({
            post_id: post.get('post_id'),
            emotion_id
          })),
          { transaction }
        );
      }

      await db.sequelize.models.user_stats.increment('my_day_post_count', {
        where: { user_id },
        transaction
      });

      await transaction.commit();
      return res.status(201).json({
        status: 'success',
        message: "오늘 하루의 기록이 성공적으로 저장되었습니다.",
        data: { post_id: post.get('post_id') }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('게시물 생성 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '게시물 저장 중 오류가 발생했습니다.'
      });
    }
  },
  getPosts: async (req: AuthRequestGeneric<never, MyDayQuery>, res: Response) => {
    try {
      const user_id = req.user?.user_id;
      if (!checkAuth(user_id)) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }


      const { 
        page = '1', 
        limit = '10', 
        emotion, 
        start_date, 
        end_date,
        sort_by = 'latest' 
      } = req.query;
      
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;

      const whereClause: any = {};
      if (emotion) {
        whereClause['$emotions.name$'] = emotion;
      }
      if (start_date && end_date) {
        whereClause.created_at = { 
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }


   // getPosts 메서드 내부의 order와 formattedPosts 부분 수정

const orderClause = [
  ...(sort_by === 'popular' 
    ? [
        ['like_count', 'DESC'], 
        ['comment_count', 'DESC'], 
        ['created_at', 'DESC']
      ] 
    : [['created_at', 'DESC']]
  )
] as [string, string][];

const posts = await db.sequelize.models.my_day_posts.findAndCountAll({
  where: whereClause,
  include: [
    {
      model: db.sequelize.models.users,
      attributes: ['nickname', 'profile_image_url']
    },
    {
      model: db.sequelize.models.emotions,
      through: { attributes: [] },
      attributes: ['emotion_id', 'name', 'icon']
    },
    {
      model: db.sequelize.models.my_day_comments,
      separate: true,
      limit: 3,
      order: [['created_at', 'DESC']] as [string, string][],
      include: [{
        model: db.sequelize.models.users,
        attributes: ['nickname']
      }]
    }
  ],
  order: orderClause,
  limit: limitNum,
  offset,
  distinct: true
});

const formattedPosts = posts.rows.map(post => {
  const postData = post.get();
  const myDayComments = post.get('my_day_comments') || [];
  
  return {
    ...postData,
    User: postData.is_anonymous ? null : post.get('User'),
    comments: myDayComments,
    total_comments: post.get('comment_count'),
    total_likes: post.get('like_count')
  };
});
  } catch (error) {
    console.error('게시물 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '게시물 조회 중 오류가 발생했습니다.'
    });
  }
},


createComment: async (req: AuthRequestGeneric<MyDayComment, never, PostParams>, res: Response) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { content, is_anonymous } = req.body;
    const user_id = req.user?.user_id;

    if (!checkAuth(user_id)) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    if (!validateContent(content, 1, 300)) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: '댓글 내용은 1자 이상 300자 이하여야 합니다.'
      });
    }


    const post = await db.sequelize.models.my_day_posts.findByPk(id, { transaction });
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    const comment = await db.sequelize.models.my_day_comments.create({
      post_id: id,
      user_id,
      content,
      is_anonymous: is_anonymous || false
    }, { transaction });

    await post.increment('comment_count', { transaction });

    if (post.get('user_id') !== user_id) {
      await db.sequelize.models.notifications.create({
        user_id: post.get('user_id'),
        content: '회원님의 게시물에 새로운 댓글이 달렸습니다.',
        notification_type: 'comment',
        related_id: comment.get('comment_id'),
        is_read: false
      }, { transaction });
    }

    await transaction.commit();
    return res.status(201).json({
      status: 'success',
      message: '댓글이 성공적으로 작성되었습니다.',
      data: { comment_id: comment.get('comment_id') }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('댓글 작성 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '댓글 작성 중 오류가 발생했습니다.'
    });
  }
},

likePost: async (req: AuthRequestGeneric<never, never, PostParams>, res: Response) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const user_id = req.user?.user_id;

    if (!checkAuth(user_id)) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const post = await db.sequelize.models.my_day_posts.findByPk(id, { transaction });
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    const [like, created] = await db.sequelize.models.my_day_likes.findOrCreate({
      where: { user_id, post_id: id },
      transaction
    });

    if (created) {
      await post.increment('like_count', { transaction });
      
      if (post.get('user_id') !== user_id) {
        await db.sequelize.models.notifications.create({
          user_id: post.get('user_id'),
          content: '회원님의 게시물에 새로운 좋아요가 추가되었습니다.',
          notification_type: 'like',
          related_id: post.get('post_id'),
          is_read: false
        }, { transaction });
      }

      await transaction.commit();
      return res.json({
        status: 'success',
        message: '게시물에 좋아요를 표시했습니다.'
      });
    } else {
      await like.destroy({ transaction });
      await post.decrement('like_count', { transaction });
      await transaction.commit();
      return res.json({
        status: 'success',
        message: '게시물 좋아요를 취소했습니다.'
      });
    }
  } catch (error) {
    await transaction.rollback();
    console.error('좋아요 처리 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '좋아요 처리 중 오류가 발생했습니다.'
    });
  }
}
};

export default myDayController;