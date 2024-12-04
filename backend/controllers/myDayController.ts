import { Response } from 'express';
import { Op, Optional } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric } from '../types/express';
import EmotionLogAttributes from '../models/EmotionLog';
import { PostQuery } from './postController';
import { getPaginationOptions, getOrderClause } from '../utils/utils';
// 인터페이스 정의

// myDayController.ts 상단의 인터페이스 수정
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
  created_at?: Date;
  updated_at?: Date;
}

interface MyDayPostWithEmotions extends MyDayPostAttributes {
  emotions?: Array<{
    emotion_id: number;
    name: string;
    icon: string;
  }>;
}

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
    user_id: user_id as number,
    emotion_id: id,
    log_date: new Date(),
    note: null
  })) as Array<Optional<EmotionLogAttributes, "note">>,
  { 
    transaction,
    validate: true
  }
);
}


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

export const getPosts = async (req: AuthRequestGeneric<never, PostQuery>, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const { emotion, start_date, end_date, sort_by = 'latest' } = req.query;
    const { limit, offset, page } = getPaginationOptions(req.query.page, req.query.limit);

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
          as: 'user', // 'as' 속성 추가
          attributes: ['nickname', 'profile_image_url'],
          required: false
        },
        {
          model: db.Emotion,
          as: 'emotions',
          attributes: ['emotion_id', 'name', 'icon'],
          through: { attributes: [] }
        }
      ],
      order: getOrderClause(sort_by),
      limit,
      offset,
      distinct: true
    });

    const formattedPosts = posts.rows.map((post) => {
      const postData: any = post.get();
      return {
        ...postData,
        User: postData.is_anonymous ? null : postData.User,
        emotions: Array.isArray(postData.emotions)
          ? postData.emotions.map((emotion: any) => emotion.get())
          : [],
        total_comments: postData.comment_count,
        total_likes: postData.like_count
      };
    });

    return res.json({
      status: 'success',
      data: {
        posts: formattedPosts,
        pagination: {
          current_page: page,
          items_per_page: limit,
          total_pages: Math.ceil(posts.count / limit),
          total_count: posts.count,
          has_next: offset + limit < posts.count
        }
      }
    });
  } catch (error) {
    console.error('게시물 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '게시물 조회 중 오류가 발생했습니다.'
    });
  }
};

// myDayController.ts 수정
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
 
    // 게시물 존재 여부 확인
    const post = await db.MyDayPost.findByPk(id, { transaction });
    
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '게시물을 찾을 수 없습니다.'
      });
    }
 
    // 댓글 생성 
    const comment = await db.MyDayComment.create({
      post_id: Number(id),
      user_id: user_id,
      content: content,
      is_anonymous: is_anonymous || false
    }, { 
      transaction 
    });
 
    // increment comment_count
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

 


// myDayPost 삭제 함수 추가
export const deletePost = async (req: AuthRequestGeneric<never, never, { id: string }>, res: Response) => {
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

    // 게시물 조회
    const post = await db.MyDayPost.findOne({
      where: { 
        post_id: id
      },
      transaction
    });
    
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '게시물을 찾을 수 없습니다.'
      });
    }
    
    // 권한 체크
    if (post.user_id !== user_id) {
      await transaction.rollback();
      return res.status(403).json({
        status: 'error',
        message: '이 게시물을 삭제할 권한이 없습니다.'
      });
    }

    // 연관된 데이터 먼저 삭제
    await db.MyDayEmotion.destroy({
      where: { post_id: id },
      transaction
    });

    await db.MyDayLike.destroy({
      where: { post_id: id },
      transaction  
    });

    await db.MyDayComment.destroy({
      where: { post_id: id },
      transaction
    });

    // 게시물 삭제  
    await db.MyDayPost.destroy({
      where: { post_id: id },
      transaction
    });

    await transaction.commit();
    return res.json({
      status: 'success',
      message: '게시물이 삭제되었습니다.'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('게시물 삭제 오류:', error);
    return res.status(500).json({
      status: 'error', 
      message: '게시물 삭제 중 오류가 발생했습니다.'
    });
  }
};
export const getMyPosts = async (req: AuthRequestGeneric<never, MyDayQuery>, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const { sort_by = 'latest' } = req.query;
    const { limit, offset, page } = getPaginationOptions(req.query.page, req.query.limit);

    const posts = await db.MyDayPost.findAndCountAll({
      where: { user_id },
      include: [
        {
          model: db.Emotion,
          as: 'emotions',
          attributes: ['emotion_id', 'name', 'icon'],
          through: { attributes: [] }
        }
      ],
      order: getOrderClause(sort_by),
      limit,
      offset,
      distinct: true
    });

    const formattedPosts = posts.rows.map(post => {
      const postData = post.get() as MyDayPostWithEmotions;
      return {
        ...postData,
        emotions: postData.emotions || []
      };
    });

    return res.json({
      status: 'success',
      data: {
        posts: formattedPosts,
        pagination: {
          current_page: page,
          items_per_page: limit,
          total_pages: Math.ceil(posts.count / limit),
          total_count: posts.count,
          has_next: offset + limit < posts.count
        }
      }
    });

  } catch (error) {
    console.error('내 게시물 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '내 게시물 조회 중 오류가 발생했습니다.'
    });
  }
};

const myDayController = {
  createPost,
  getPosts,
  getMyPosts, // getMyPosts 추가
  createComment,
  likePost,
  deletePost
};

export default myDayController;