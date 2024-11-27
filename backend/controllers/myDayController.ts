import { Response } from 'express';  // Response import 추가
import { Optional } from 'sequelize';  // Optional import 추가
import db from '../models';
import { Op } from 'sequelize';
import { AuthRequestGeneric } from '../types/express';
import EmotionLogAttributes from '../models/EmotionLog';

// 인터페이스 정의
interface MyDayPost {
  content: string;
  emotion_summary?: string;  
  image_url?: string;
  is_anonymous?: boolean;
  emotion_ids?: number[];
  
}
interface MyDayCommentAttributes {
  comment_id?: number;
  post_id: number;
  user_id: number;
  content: string;
  is_anonymous: boolean;
  created_at?: Date;
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

// 유틸리티 함수
const validateContent = (content: string, minLength: number, maxLength: number): boolean => {
 return content.length >= minLength && content.length <= maxLength;
};

const checkAuth = (user_id: number | undefined): boolean => {
 return !!user_id;
};

const getTodayRange = () => {
 const start = new Date();
 start.setHours(0, 0, 0, 0);
 const end = new Date();
 end.setHours(23, 59, 59, 999);
 return { start, end };
};


export const createPost = async (req: AuthRequestGeneric<MyDayPost>, res: Response) => {
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

    if (!validateContent(content, 10, 1000)) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: '게시물 내용은 10자 이상 1000자 이하여야 합니다.'
      });
    }

   // 오늘 작성한 게시물 확인
   const { start, end } = getTodayRange();
   const existingPost = await db.MyDayPost.findOne({
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
// 게시물 생성
const newPost = await db.MyDayPost.create({
  user_id,
  content,
  emotion_summary: emotion_summary || undefined,  // null 대신 undefined 사용
  image_url: image_url || undefined,             // null 대신 undefined 사용
  is_anonymous: is_anonymous || false,           
  character_count: content.length,
  like_count: 0,
  comment_count: 0
}, { transaction });

if (Array.isArray(emotion_ids) && emotion_ids.length > 0) {
  const emotions = await db.Emotion.findAll({
    where: {
      emotion_id: {
        [Op.in]: emotion_ids
      }
    },
    attributes: ['emotion_id', 'name', 'icon'],  // 실제 컬럼명과 일치
    transaction
  });

  if (!emotions || emotions.length !== emotion_ids.length) {
    await transaction.rollback();
    return res.status(400).json({
      status: 'error',
      message: '유효하지 않은 감정이 포함되어 있습니다.'
    });
  }
// 게시물-감정 연결  
await db.MyDayEmotion.bulkCreate(
  emotion_ids.map(id => ({
    post_id: Number(newPost.get('post_id')),  // 명시적으로 숫자 타입으로 변환
    emotion_id: id
  })),
  { transaction }
);

await db.EmotionLog.bulkCreate(
  emotion_ids.map(id => ({
    user_id: user_id as number,  // 명시적으로 숫자 타입으로 변환
    emotion_id: id,
    log_date: new Date(),
    note: null
  })) as Array<Optional<EmotionLogAttributes, "note">>,  // 타입 명시적 지정
  { 
    transaction,
    validate: true  // 유효성 검사 추가
  }
);
}

// single field increment로 변경
await db.sequelize.models.user_stats.update(
  { my_day_post_count: db.sequelize.literal('my_day_post_count + 1') },
  { 
    where: { user_id },
    transaction
  }
);

await transaction.commit();
return res.json({
  status: 'success',
  message: '작업이 성공적으로 완료되었습니다.',
  data: {
  post_id: newPost.get('post_id')
}
});

} catch (error) {
  await transaction.rollback();
  console.error('Post creation error:', error);
  return res.status(500).json({
    status: 'error',
    message: '게시물 저장 중 오류가 발생했습니다.',
    details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
  });
}
};

// myDayController.ts의 getPosts 함수만 수정

export const getPosts = async (req: AuthRequestGeneric<never, MyDayQuery>, res: Response) => {
  // getPosts 함수 내용
  try {
    const user_id = req.user?.user_id;
    if (!checkAuth(user_id)) {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const { page = '1', limit = '10', emotion, start_date, end_date, sort_by = 'latest' } = req.query;
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

    const posts = await db.MyDayPost.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          attributes: ['user_id', 'nickname', 'profile_image_url']
        },
        {
          model: db.Emotion,
          through: { attributes: [] },
          attributes: ['emotion_id', 'name', 'icon']
        },
        {
          model: db.MyDayComment,
          separate: true,
          limit: 3,
          order: [['created_at', 'DESC']],
          include: [{
            model: db.User,
            attributes: ['nickname']
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset,
      distinct: true
    });
    const formattedPosts = posts.rows.map(post => ({
      ...post.get(),
      User: post.get('is_anonymous') ? null : post.get('User'),
      emotions: post.get('emotions') || [],
      comments: post.get('my_day_comments') || []
    }));

    return res.json({
      status: 'success',
      data: {
        posts: formattedPosts,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(posts.count / limitNum),
          total_count: posts.count,
          has_next: offset + limitNum < posts.count
        }
      }
    });

  }catch (error) {
    console.error('게시물 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '게시물 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    });
  }
};

export const createComment = async (req: AuthRequestGeneric<MyDayComment, never, PostParams>, res: Response) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { content, is_anonymous = false } = req.body;
    const user_id = req.user?.user_id;
 
    if (!user_id) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }
 
    const post = await db.MyDayPost.findByPk(id, { transaction });
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '게시물을 찾을 수 없습니다.'
      });
    }
// 댓글 생성 
const comment = await db.sequelize.models.my_day_comments.create({
  post_id: Number(id),
  user_id: user_id,
  content: content,
  is_anonymous: is_anonymous || false
}, { 
  transaction 
});

// increment 부분도 수정
await db.MyDayPost.increment('comment_count', {
  by: 1,
  where: { post_id: Number(id) },
  transaction
});

if (post.get('user_id') !== user_id) {
  await db.Notification.create({
    user_id: post.get('user_id'),
    content: '회원님의 게시물에 새로운 댓글이 달렸습니다.',
    notification_type: 'comment',
    is_read: false
  }, { transaction });
}

  
await transaction.commit();
return res.status(201).json({
  status: 'success',
  data: {
    comment_id: comment.get('comment_id')
  }
});

 } catch (error) {
  await transaction.rollback();
  console.error('댓글 작성 오류:', error);
  return res.status(500).json({
    status: 'error',
    message: '댓글 작성 중 오류가 발생했습니다.',
    details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
  });
}
};


export const likePost = async (req: AuthRequestGeneric<never, never, PostParams>, res: Response) => {
  const transaction = await db.sequelize.transaction(); 
  try {
    const { id } = req.params;
    const user_id = req.user?.user_id;
 
    if (!user_id) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'  
      });
    }
 
    const post = await db.MyDayPost.findByPk(id, { transaction });
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '게시물을 찾을 수 없습니다.'
      });
    }
 
   // 좋아요 찾거나 생성
   const [like, created] = await db.MyDayLike.findOrCreate({
    where: { 
      user_id, 
      post_id: Number(id)  // 명시적으로 숫자 타입으로 변환 
    },
    transaction
  });

  if (created) {
    await db.MyDayPost.increment('like_count', {
      by: 1,
      where: { post_id: Number(id) },
      transaction
    });

    if (post.get('user_id') !== user_id) {
      await db.Notification.create({
        user_id: post.get('user_id'),
        content: '회원님의 게시물에 새로운 좋아요가 추가되었습니다.',
        notification_type: 'like',
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
      await db.MyDayPost.decrement('like_count', {
        where: { post_id: Number(id) },  // 명시적으로 숫자 타입으로 변환
        transaction
      });
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
 };
const myDayController = {
  createPost,
  getPosts,
  createComment,
  likePost
};

export default myDayController;