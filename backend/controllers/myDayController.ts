import { Response } from 'express';
import { Op, Transaction } from 'sequelize';
import db from '../models';
import { AuthRequest } from '../types/express';

// 기본 인터페이스 정의
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

// 확장 모델 인터페이스
interface MyDayPostModel {
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
  increment(field: string, options?: any): Promise<any>;
  decrement(field: string, options?: any): Promise<any>;
  addEmotions(emotionIds: number[], options?: any): Promise<any>;
  User?: {
    nickname: string;
    profile_image_url: string;
  };
  Emotions?: Array<{
    emotion_id: number;
    name: string;
    icon: string;
  }>;
  MyDayComments?: Array<{
    comment_id: number;
    content: string;
    User: {
      nickname: string;
    };
    created_at: Date;
  }>;
  toJSON(): any;
}

// 유틸리티 함수
const checkAuth = (userId: number | undefined): boolean => {
  return userId !== undefined;
};

const validateContent = (content: string | undefined | null, minLength: number, maxLength: number): boolean => {
  if (typeof content !== 'string') return false;
  return content.length >= minLength && content.length <= maxLength;
};

const getTodayStart = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const formatPaginationData = (count: number, page: number, limit: number, offset: number) => ({
  current_page: page,
  total_pages: Math.ceil(count / limit),
  total_count: count,
  has_next: offset + limit < count
});

const myDayController = {
  createPost: async (req: AuthRequest<MyDayPost>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { content, emotion_summary, image_url, is_anonymous, emotion_ids } = req.body;
      const user_id = req.user?.id;

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

      // 오늘 하루 게시물 체크
      const today = getTodayStart();
      const existingPost = await db.MyDayPost.findOne({
        where: {
          user_id,
          created_at: {
            [Op.gte]: today
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
      const post = await db.MyDayPost.create({
        user_id,
        content,
        emotion_summary,
        image_url,
        is_anonymous: is_anonymous || false,
        character_count: content.length
      }, { transaction });

      // 감정 태그 처리
      if (emotion_ids?.length) {
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

      // 통계 업데이트
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

  getPosts: async (req: AuthRequest<never, MyDayQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;
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

      // 쿼리 조건 구성
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
        limit: limitNum,
        offset,
        distinct: true
      });

      const formattedPosts = posts.rows.map((post: MyDayPostModel) => {
        const postJson = post.toJSON();
        return {
          ...postJson,
          User: post.is_anonymous ? null : postJson.User,
          comment_preview: postJson.MyDayComments?.slice(0, 3),
          total_comments: post.comment_count,
          total_likes: post.like_count
        };
      });

      res.json({
        status: 'success',
        data: {
          posts: formattedPosts,
          pagination: formatPaginationData(posts.count, pageNum, limitNum, offset)
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

  createComment: async (req: AuthRequest<MyDayComment, never, PostParams>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { content, is_anonymous } = req.body;
      const user_id = req.user?.id;

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

      if (!checkAuth(user_id)) {
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
            content: '회원님의 게시물에 새로운 좋아요가 추가되었습니다.',
            notification_type: 'like',
            related_id: post.post_id
          }, { transaction });
        }

        await transaction.commit();
        res.json({
          status: 'success',
          message: '게시물에 좋아요를 표시했습니다.'
        });
      } else {
        await like.destroy({ transaction });
        await post.decrement('like_count', { transaction });
        await transaction.commit();
        res.json({
          status: 'success',
          message: '게시물 좋아요를 취소했습니다.'
        });
      }
    } catch (error) {
      await transaction.rollback();
      console.error('좋아요 처리 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '좋아요 처리 중 오류가 발생했습니다.'
      });
    }
  }
};

export default myDayController;