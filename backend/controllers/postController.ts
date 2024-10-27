import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequest } from '../types/express';
import { Model } from 'sequelize';


interface MyDayPostModel extends Model {
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
  User?: {
    nickname: string;
    profile_image_url: string;
  };
  MyDayComments?: Array<{
    comment_id: number;
    content: string;
    User: {
      nickname: string;
    };
    created_at: Date;
  }>;
}
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

const postController = {
  createPost: async (req: AuthRequest<PostCreate>, res: Response) => {
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

      if (!content || content.length < 10 || content.length > 1000) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '게시물 내용은 10자 이상 1000자 이하여야 합니다.'
        });
      }

      const post = await db.MyDayPost.create({
        user_id,
        content,
        emotion_summary,
        image_url,
        is_anonymous: is_anonymous || false,
        character_count: content.length
      }, { transaction });

      if (emotion_ids && emotion_ids.length > 0) {
        const emotions = await db.Emotion.findAll({
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

        await post.addEmotions(emotion_ids, { transaction });
      }

      await db.UserStats.increment('my_day_post_count', {
        where: { user_id },
        transaction
      });

      await transaction.commit();
      res.status(201).json({
        status: 'success',
        message: "오늘 하루의 기록이 성공적으로 저장되었습니다.",
        data: {
          post_id: post.post_id
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('게시물 생성 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '게시물 저장 중 오류가 발생했습니다.'
      });
    }
  },

  getPosts: async (req: AuthRequest<never, PostQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;
      
      if (!user_id) {
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
      
      const offset = (Number(page) - 1) * Number(limit);

      const whereClause: any = {};
      if (emotion) {
        whereClause['$Emotions.name$'] = emotion;
      }
      if (start_date && end_date) {
        whereClause.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      const orderClause = sort_by === 'popular'
        ? [['like_count', 'DESC'], ['comment_count', 'DESC'], ['created_at', 'DESC']]
        : [['created_at', 'DESC']];

      const posts = await db.MyDayPost.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.User,
            attributes: ['nickname', 'profile_image_url']
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
        order: orderClause,
        limit: Number(limit),
        offset,
        distinct: true
      });

      const formattedPosts = posts.rows.map((post: MyDayPostModel) => ({
        ...post.toJSON(),
        User: post.is_anonymous ? null : post.User,
        comment_preview: post.MyDayComments?.slice(0, 3),
        total_comments: post.comment_count,
        total_likes: post.like_count
      }));

      res.json({
        status: 'success',
        data: {
          posts: formattedPosts,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(posts.count / Number(limit)),
            total_count: posts.count,
            has_next: offset + Number(limit) < posts.count
          }
        }
      });
    } catch (error) {
      console.error('게시물 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '게시물 조회 중 오류가 발생했습니다.'
      });
    }
  },

  getMyPosts: async (req: AuthRequest<never, PostQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { 
        page = '1', 
        limit = '10',
        start_date,
        end_date 
      } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);

      const whereClause: any = { user_id };
      if (start_date && end_date) {
        whereClause.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      const posts = await db.MyDayPost.findAndCountAll({
        where: whereClause,
        include: [
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
        limit: Number(limit),
        offset
      });

      res.json({
        status: 'success',
        data: {
          posts: posts.rows,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(posts.count / Number(limit)),
            total_count: posts.count,
            has_next: offset + Number(limit) < posts.count
          }
        }
      });
    } catch (error) {
      console.error('내 게시물 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '내 게시물 조회 중 오류가 발생했습니다.'
      });
    }
  },

  createComment: async (req: AuthRequest<PostComment, never, PostParams>, res: Response) => {
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

      if (!content || content.length < 1 || content.length > 300) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '댓글 내용은 1자 이상 300자 이하여야 합니다.'
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

      const comment = await db.MyDayComment.create({
        post_id: id,
        user_id,
        content,
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
      res.status(201).json({
        status: 'success',
        message: '댓글이 성공적으로 작성되었습니다.',
        data: {
          comment_id: comment.comment_id
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('댓글 작성 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '댓글 작성 중 오류가 발생했습니다.'
      });
    }
  },

  likePost: async (req: AuthRequest<never, never, PostParams>, res: Response) => {
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

      const post = await db.MyDayPost.findByPk(id, { transaction });
      if (!post) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        });
      }

      const [like, created] = await db.MyDayLike.findOrCreate({
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
        res.json({
          status: 'success',
          message: '게시물에 공감을 표시했습니다.'
        });
      } else {
        await like.destroy({ transaction });
        await post.decrement('like_count', { transaction });
        await transaction.commit();
        res.json({
          status: 'success',
          message: '게시물 공감을 취소했습니다.'
        });
      }
    } catch (error) {
      await transaction.rollback();
      console.error('공감 처리 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '공감 처리 중 오류가 발생했습니다.'
      });
    }
  }
};

export default postController;