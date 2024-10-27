import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequest } from '../types/express';

interface SomeoneDayPost {
  title: string;
  content: string;
  image_url?: string;
  is_anonymous?: boolean;
  tag_ids?: number[];
}

interface SomeoneDayQuery {
  page?: string;
  limit?: string;
  tag?: string;
  sort_by?: 'latest' | 'popular';
  start_date?: string;
  end_date?: string;
}

interface PostReport {
  reason: string;
  details?: string;
}

interface PostParams {
  id: string;
}

const someoneDayController = {
  createPost: async (req: AuthRequest<SomeoneDayPost>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { title, content, image_url, is_anonymous, tag_ids } = req.body;
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (!title || title.length < 5 || title.length > 100) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '제목은 5자 이상 100자 이하여야 합니다.'
        });
      }

      if (!content || content.length < 20 || content.length > 2000) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '게시물 내용은 20자 이상 2000자 이하여야 합니다.'
        });
      }

      const post = await db.SomeoneDayPost.create({
        user_id,
        title,
        content,
        image_url,
        summary: content.substring(0, 200),
        is_anonymous: is_anonymous || false,
        character_count: content.length
      }, { transaction });

      if (tag_ids && tag_ids.length > 0) {
        const tags = await db.Tag.findAll({
          where: { tag_id: { [Op.in]: tag_ids } },
          transaction
        });

        if (tags.length !== tag_ids.length) {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: '유효하지 않은 태그가 포함되어 있습니다.'
          });
        }

        await post.addTags(tag_ids, { transaction });
      }

      await db.UserStats.increment('someone_day_post_count', {
        where: { user_id },
        transaction
      });

      await transaction.commit();
      res.status(201).json({
        status: 'success',
        message: "게시물이 성공적으로 생성되었습니다.",
        data: {
          post_id: post.post_id
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('게시물 생성 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '게시물 생성 중 오류가 발생했습니다.'
      });
    }
  },

  getPosts: async (req: AuthRequest<never, SomeoneDayQuery>, res: Response) => {
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
        tag,
        sort_by = 'latest',
        start_date,
        end_date
      } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);

      const whereClause: any = {};
      if (tag) {
        whereClause['$Tags.name$'] = tag;
      }
      if (start_date && end_date) {
        whereClause.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }

      const orderClause = sort_by === 'popular'
        ? [
            ['like_count', 'DESC'],
            ['message_count', 'DESC'],
            ['created_at', 'DESC']
          ]
        : [['created_at', 'DESC']];

      const posts = await db.SomeoneDayPost.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.User,
            attributes: ['nickname', 'profile_image_url']
          },
          {
            model: db.Tag,
            through: { attributes: [] },
            attributes: ['tag_id', 'name']
          },
          {
            model: db.EncouragementMessage,
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

      const formattedPosts = posts.rows.map(post => ({
        ...post.toJSON(),
        User: post.is_anonymous ? null : post.User,
        message_preview: post.EncouragementMessages?.slice(0, 3),
        total_messages: post.message_count,
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

  getPopularPosts: async (req: AuthRequest, res: Response) => {
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const posts = await db.SomeoneDayPost.findAll({
        include: [
          {
            model: db.User,
            attributes: ['nickname', 'profile_image_url']
          },
          {
            model: db.Tag,
            through: { attributes: [] },
            attributes: ['tag_id', 'name']
          },
          {
            model: db.EncouragementMessage,
            attributes: []
          }
        ],
        attributes: {
          include: [
            [
              db.sequelize.fn('COUNT', db.sequelize.col('EncouragementMessages.message_id')),
              'message_count'
            ]
          ]
        },
        group: ['SomeoneDayPost.post_id', 'User.user_id', 'Tags.tag_id'],
        order: [
          [db.sequelize.literal('message_count'), 'DESC'],
          ['like_count', 'DESC']
        ],
        limit: 10,
        where: {
          created_at: {
            [Op.gte]: db.sequelize.literal('DATE_SUB(NOW(), INTERVAL 7 DAY)')
          }
        }
      });

      const formattedPosts = posts.map(post => ({
        ...post.toJSON(),
        User: post.is_anonymous ? null : post.User
      }));

      res.json({
        status: 'success',
        data: {
          posts: formattedPosts
        }
      });
    } catch (error) {
      console.error('인기 게시물 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '인기 게시물 조회 중 오류가 발생했습니다.'
      });
    }
  },

  reportPost: async (req: AuthRequest<PostReport, never, PostParams>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { reason, details } = req.body;
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (!reason || reason.length < 5 || reason.length > 200) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '신고 이유는 5자 이상 200자 이하여야 합니다.'
        });
      }

      const existingReport = await db.PostReport.findOne({
        where: {
          post_id: id,
          reporter_id: user_id
        },
        transaction
      });

      if (existingReport) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '이미 신고한 게시물입니다.'
        });
      }

      await db.PostReport.create({
        post_id: id,
        reporter_id: user_id,
        reason,
        details
      }, { transaction });

      await transaction.commit();
      res.json({
        status: 'success',
        message: "게시물이 성공적으로 신고되었습니다. 관리자가 검토 후 조치하겠습니다."
      });
    } catch (error) {
      await transaction.rollback();
      console.error('게시물 신고 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '게시물 신고 중 오류가 발생했습니다.'
      });
    }
  }
};

export default someoneDayController;