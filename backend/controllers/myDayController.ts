import { Response } from 'express';
import { Op, Model } from 'sequelize';
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

// EmotionAttributes 인터페이스 정의
interface EmotionAttributes {
  emotion_id: number;
  name: string;
  icon: string;
}

interface EmotionInstance extends Model<EmotionAttributes>, EmotionAttributes {}
interface MyDayPostInstance extends Model<MyDayPostAttributes, MyDayPostAttributes> {
  post_id: number;
  user_id: number;
}

// MyDayPost 모델 임포트
import MyDayPostModel from '../models/MyDayPost'; // 경로와 모델 이름이 올바른지 확인

// 유효성 검사 함수
const validateContent = (content: string, minLength: number, maxLength: number): boolean => {
  return content.length >= minLength && content.length <= maxLength;
};

// 인증 확인 함수
const checkAuth = (user_id: number | undefined): boolean => {
  return !!user_id;
};

// 오늘 날짜 범위 함수
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const myDayController = {
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

// myDayController.ts의 createPost 함수 내부 수정
if (Array.isArray(emotion_ids) && emotion_ids.length > 0) {
  const emotions = await db.sequelize.models.emotions.findAll({
    where: { 
      emotion_id: emotion_ids
    },
    transaction
  });

  const foundEmotionIds = emotions.map(e => e.get('emotion_id'));
  const hasInvalidEmotions = emotion_ids.some(id => !foundEmotionIds.includes(id));

  if (hasInvalidEmotions) {
    await transaction.rollback();
    return res.status(400).json({
      status: 'error',
      message: '유효하지 않은 감정이 포함되어 있습니다.'
    });
  }

  // my_day_emotions 테이블에 데이터 삽입
  await db.sequelize.models.my_day_emotions.bulkCreate(
    emotion_ids.map(id => ({
      post_id: post.get('post_id'),
      emotion_id: id
    })),
    { transaction }
  );

  // emotion_logs 테이블에도 데이터 기록
  await db.sequelize.models.emotion_logs.bulkCreate(
    emotion_ids.map(id => ({
      user_id,
      emotion_id: id,
      log_date: new Date(),
      note: null
    })),
    { transaction }
  );
}
      await db.sequelize.models.user_stats.increment(
        { my_day_post_count: 1 },
        {
          where: { user_id: user_id },
          transaction
        }
      );

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
      console.error('Post creation error:', error);
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

      const orderClause = [
        ...(sort_by === 'popular'
          ? [
              ['like_count', 'DESC'],
              ['comment_count', 'DESC'],
              ['created_at', 'DESC']
            ]
          : [['created_at', 'DESC']])
      ] as [string, string][];

      const posts = await MyDayPostModel.findAndCountAll({
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