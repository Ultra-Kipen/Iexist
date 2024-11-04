import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric } from '../types/express';
import { MyDayPost, MyDayComment, User, Emotion, MyDayLike } from '../models';

// 인터페이스 정의
interface PostCreate {
  content: string;
  emotion_summary?: string;
  image_url?: string;
  is_anonymous?: boolean;
  emotion_ids?: number[];
}

interface PostQuery {
  page?: string;
  limit?: string;
  emotion?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'latest' | 'popular';
}

interface PostComment {
  content: string;
  is_anonymous?: boolean;
}

interface PostParams {
  id: string;
}

// 페이지네이션 유틸리티 함수
const getPaginationOptions = (page?: string, limit?: string) => {
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit || '10', 10)));
  const parsedPage = Math.max(1, parseInt(page || '1', 10));
  
  return {
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit,
    page: parsedPage
  };
};

const postController = {
  createPost: async (req: AuthRequestGeneric<PostCreate>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { content, emotion_summary, image_url, is_anonymous, emotion_ids } = req.body;
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (!content?.trim() || content.length < 10 || content.length > 1000) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '게시물 내용은 10자 이상 1000자 이하여야 합니다.'
        });
      }

      const post = await MyDayPost.create({
        user_id,
        content: content.trim(),
        emotion_summary,
        image_url,
        is_anonymous: is_anonymous || false,
        character_count: content.length
      }, { transaction });

    // 1. emotion_ids 처리 부분

    try {
      if (emotion_ids && Array.isArray(emotion_ids) && emotion_ids.length > 0) {
        const emotions = await Emotion.findAll({
          where: {
            emotion_id: {
              [Op.in]: emotion_ids
            }
          },
          transaction
        });
    
        if (emotions.length !== emotion_ids.length) {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: '유효하지 않은 감정이 포함되어 있습니다.'
          });
        }
    
        await (post as any).setEmotions(emotions.map(emotion => emotion.emotion_id), { transaction });
      }
    } catch (error) {
      await transaction.rollback();
      console.error('감정 태그 추가 오류:', error);
      return res.status(400).json({
        status: 'error',
        message: '감정 태그 추가 중 오류가 발생했습니다.'
      });
    }
      await db.UserStats.increment('my_day_post_count', {
        where: { user_id },
        transaction
      });

      await transaction.commit();
      return res.status(201).json({
        status: 'success',
        message: "오늘 하루의 기록이 성공적으로 저장되었습니다.",
        data: {
          post_id: post.post_id
        }
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

  getPosts: async (req: AuthRequestGeneric<never, PostQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;
      
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

     // 정렬 조건 설정 부분
     type OrderClause = [string, 'ASC' | 'DESC'][];

     const getOrderClause = (sortBy: string = 'latest'): OrderClause => {
       const orderClauses: Record<string, OrderClause> = {
         popular: [
           ['like_count', 'DESC'],
           ['comment_count', 'DESC'],
           ['created_at', 'DESC']
         ],
         latest: [['created_at', 'DESC']]
       };
       
       return orderClauses[sortBy] || orderClauses.latest;
     };
        const posts = await MyDayPost.findAndCountAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['nickname', 'profile_image_url'],
              required: false
            },
            {
              model: Emotion,
              as: 'emotions',
              through: { attributes: [] },
              attributes: ['emotion_id', 'name', 'icon']
            },
            {
              model: MyDayComment,
              as: 'comments',
              separate: true,
              limit: 3,
              order: [['created_at', 'DESC'] as const],
              include: [{
                model: User,
                as: 'user',
                attributes: ['nickname'],
                required: false
              }]
            }
          ],
          order: getOrderClause(sort_by),
          limit,
          offset,
          distinct: true
        });

      const formattedPosts = posts.rows.map(post => {
        const postData = post.toJSON();
        return {
          ...postData,
          user: postData.is_anonymous ? null : postData.user,
          comments: postData.comments?.slice(0, 3),
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
  },

  getMyPosts: async (req: AuthRequestGeneric<never, PostQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { start_date, end_date } = req.query;
      const { limit, offset, page } = getPaginationOptions(req.query.page, req.query.limit);

      const whereClause: any = { user_id };
      if (start_date && end_date) {
        whereClause.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      const posts = await MyDayPost.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['nickname', 'profile_image_url'],
            required: false
          },
          {
            model: Emotion,
            as: 'emotions',
            through: { attributes: [] },
            attributes: ['emotion_id', 'name', 'icon']
          },
          {
            model: MyDayComment,
            as: 'comments',
            separate: true,
            limit: 3,
            order: [['created_at', 'DESC']] as [string, string][],
            include: [{
              model: User,
              as: 'user',
              attributes: ['nickname'],
              required: false
            }]
          }
        ],
        order: [['created_at', 'DESC']] as [string, string][],
        limit,
        offset,
        distinct: true
      });
      return res.json({
        status: 'success',
        data: {
          posts: posts.rows,
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
  },

  createComment: async (req: AuthRequestGeneric<PostComment, never, PostParams>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { content, is_anonymous } = req.body;
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (!content?.trim() || content.length < 1 || content.length > 300) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '댓글 내용은 1자 이상 300자 이하여야 합니다.'
        });
      }

      const post = await MyDayPost.findByPk(id, { transaction });
      if (!post) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        });
      }

      const comment = await MyDayComment.create({
        post_id: id,
        user_id,
        content: content.trim(),
        is_anonymous: is_anonymous || false
      }, { transaction });

      await post.increment('comment_count', { transaction });

      if (post.user_id !== user_id) {
        await db.Notification.create({
          user_id: post.user_id,
          content: '회원님의 게시물에 새로운 댓글이 달렸습니다.',
          notification_type: 'comment',
          related_id: comment.comment_id
        }, { transaction });
      }

      await transaction.commit();
      return res.status(201).json({
        status: 'success',
        message: '댓글이 성공적으로 작성되었습니다.',
        data: {
          comment_id: comment.comment_id
        }
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
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const post = await MyDayPost.findByPk(id, { transaction });
      if (!post) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        });
      }

      const [like, created] = await MyDayLike.findOrCreate({
        where: { user_id, post_id: id },
        transaction
      });

      if (created) {
        await post.increment('like_count', { transaction });

        if (post.user_id !== user_id) {
          await db.Notification.create({
            user_id: post.user_id,
            content: '회원님의 게시물에 새로운 공감이 추가되었습니다.',
            notification_type: 'like',
            related_id: post.post_id
          }, { transaction });
        }

        await transaction.commit();
        return res.json({
          status: 'success',
          message: '게시물에 공감을 표시했습니다.'
        });
      } else {
        await like.destroy({ transaction });
        await post.decrement('like_count', { transaction });
        await transaction.commit();
        return res.json({
          status: 'success',
          message: '게시물 공감을 취소했습니다.'
        });
      }
    } catch (error) {
      await transaction.rollback();
      console.error('공감 처리 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '공감 처리 중 오류가 발생했습니다.'
      });
    }
  }
};

export default postController;