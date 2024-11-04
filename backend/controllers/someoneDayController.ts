import { Response } from 'express';
import { Op, Model } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric } from '../types/express';
import { validateRequest, body, query, param } from '../middleware/validationMiddleware';

// SomeoneDayPost 모델 인터페이스
interface SomeoneDayPostAttributes {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  summary?: string;
  image_url?: string;
  is_anonymous: boolean;
  character_count?: number;
  like_count: number;
  comment_count: number;
  created_at?: Date;
  updated_at?: Date;
  user?: {
    nickname: string;
    profile_image_url?: string;
  };
  tags?: Array<{
    tag_id: number;
    name: string;
  }>;
}

interface PostReportCreate {
  post_id: number;
  reporter_id: number;
  report_type: 'spam' | 'inappropriate' | 'harassment' | 'other' | 'content';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
}
// 파일 상단에 타입 정의 추가
type PostReportType = 'spam' | 'inappropriate' | 'harassment' | 'other' | 'content';
type PostReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

// PostReportAttributes 인터페이스 수정
interface PostReportAttributes {
  post_id: number;
  reporter_id: number;
  report_type: PostReportType;  // string 대신 구체적인 타입 사용
  description: string;
  status: PostReportStatus;     // string 대신 구체적인 타입 사용
  created_at?: Date;
  updated_at?: Date;
}
// Request 인터페이스
interface SomeoneDayPostCreate {
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

// Validation rules
export const someoneDayValidations = {
  createPost: [
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    body('content')
      .trim()
      .isLength({ min: 20, max: 2000 })
      .withMessage('게시물 내용은 20자 이상 2000자 이하여야 합니다.'),
    body('tag_ids')
      .optional()
      .isArray()
      .withMessage('태그 ID는 배열 형태여야 합니다.')
  ],
  
  getPopularPosts: [
    query('days')
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage('조회 기간은 1일에서 30일 사이여야 합니다.')
  ],

  reportPost: [
    param('id')
      .isInt()
      .withMessage('유효한 게시물 ID가 아닙니다.'),
    body('reason')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('신고 이유는 5자 이상 200자 이하여야 합니다.'),
    body('details')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('상세 내용은 1000자를 초과할 수 없습니다.')
  ],

  sendEncouragement: [
    param('id')
      .isInt()
      .withMessage('유효한 게시물 ID가 아닙니다.'),
    body('message')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('격려 메시지는 1자 이상 1000자 이하여야 합니다.'),
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]
};

// 유틸리티 함수
const getPaginationOptions = (page?: string, limit?: string) => {
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit || '10', 10)));
  const parsedPage = Math.max(1, parseInt(page || '1', 10));
  
  return {
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit,
    page: parsedPage
  };
};

const getOrderClause = (sortBy: string = 'latest'): [string, string][] => {
  const orderClauses: Record<string, [string, string][]> = {
    popular: [
      ['like_count', 'DESC'],
      ['comment_count', 'DESC'],
      ['created_at', 'DESC']
    ],
    latest: [['created_at', 'DESC']]
  };
  
  return orderClauses[sortBy] || orderClauses.latest;
};
const someoneDayController = {
  createPost: async (req: AuthRequestGeneric<SomeoneDayPostCreate>, res: Response) => {
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

      const post = await db.SomeoneDayPost.create({
        user_id,
        title: title.trim(),
        content: content.trim(),
        image_url,
        summary: content.substring(0, 200),
        is_anonymous: is_anonymous || false,
        character_count: content.length,
        like_count: 0,
        comment_count: 0
      }, { transaction });

      if (tag_ids?.length) {
        const tags = await db.Tag.findAll({
          where: {
            tag_id: {
              [Op.in]: tag_ids
            }
          },
          transaction
        });

        if (tags.length !== tag_ids.length) {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: '유효하지 않은 태그가 포함되어 있습니다.'
          });
        }

        await (post as any).setTags(tags, { transaction });
      }

      await db.UserStats.increment('someone_day_post_count', {
        where: { user_id },
        transaction
      });

      await transaction.commit();
      return res.status(201).json({
        status: 'success',
        message: "게시물이 성공적으로 생성되었습니다.",
        data: { post_id: post.post_id }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('게시물 생성 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '게시물 생성 중 오류가 발생했습니다.'
      });
    }
  },

  getPosts: async (req: AuthRequestGeneric<never, SomeoneDayQuery>, res: Response) => {
    try {
      const user_id = req.user?.id;
 
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
 
      const { tag, sort_by = 'latest', start_date, end_date } = req.query;
      const { limit, offset, page } = getPaginationOptions(req.query.page, req.query.limit);
 
      const whereClause: any = {};
      if (tag) {
        whereClause['$tags.name$'] = tag;
      }
      if (start_date && end_date) {
        whereClause.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }
 
      const posts = await db.SomeoneDayPost.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['nickname', 'profile_image_url'],
            required: false
          },
          {
            model: db.Tag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['tag_id', 'name']
          }
        ],
        order: getOrderClause(sort_by),
        limit,
        offset,
        distinct: true,
        attributes: {
          include: [
            'post_id',
            'title',
            'content',
            'summary',
            'image_url',
            'is_anonymous',
            'like_count',
            'comment_count',
            'created_at'
          ]
        }
      });
 
      return res.json({
        status: 'success',
        data: {
          posts: posts.rows.map(post => ({
            ...post.get({ plain: true }),
            user: post.is_anonymous ? null : post.get('user')
          })),
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

  getPopularPosts: async (req: AuthRequestGeneric<never, { days?: string }>, res: Response) => {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const days = parseInt(req.query.days || '7', 10);
      
      const posts = await db.SomeoneDayPost.findAll({
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['nickname', 'profile_image_url'],
            required: false
          },
          {
            model: db.Tag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['tag_id', 'name']
          }
        ],
        where: {
          created_at: {
            [Op.gte]: db.sequelize.literal(`DATE_SUB(NOW(), INTERVAL ${days} DAY)`)
          }
        },
        order: [
          ['like_count', 'DESC'],
          ['comment_count', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: 10,
        attributes: [
          'post_id',
          'title',
          'content',
          'summary',
          'image_url',
          'is_anonymous',
          'like_count',
          'comment_count',
          'created_at'
        ]
      });

      return res.json({
        status: 'success',
        data: {
          posts: posts.map(post => ({
            ...post.get({ plain: true }),
            user: post.is_anonymous ? null : post.get('user')
          }))
        }
      });
    } catch (error) {
      console.error('인기 게시물 조회 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '인기 게시물 조회 중 오류가 발생했습니다.'
      });
    }
  },

  reportPost: async (req: AuthRequestGeneric<PostReport, never, PostParams>, res: Response) => {
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

      const post = await db.SomeoneDayPost.findByPk(id, { transaction });
      if (!post) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
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
   enum PostReportType {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  HARASSMENT = 'harassment',
  OTHER = 'other',
  CONTENT = 'content'
}

enum PostReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

// reportPost 메서드 내의 PostReport.create 부분을 다음과 같이 수정
const reportData: PostReportCreate = {
  post_id: Number(id),
  reporter_id: user_id,
  report_type: 'content',
  description: details || reason,
  status: 'pending'
};

await db.PostReport.create(reportData, { transaction });

      await transaction.commit();
      return res.json({
        status: 'success',
        message: '게시물이 성공적으로 신고되었습니다. 관리자가 검토 후 조치하겠습니다.'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('게시물 신고 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '게시물 신고 중 오류가 발생했습니다.'
      });
    }
  },

  sendEncouragement: async (
    req: AuthRequestGeneric<{ message: string; is_anonymous?: boolean }, never, PostParams>,
    res: Response
  ) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { message, is_anonymous } = req.body;
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const post = await db.SomeoneDayPost.findByPk(id, { transaction });
      if (!post) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        });
      }

      const encouragementMessage = await db.EncouragementMessage.create({
        sender_id: user_id,
        receiver_id: post.user_id,
        post_id: Number(id),
        message: message.trim(),
        is_anonymous: is_anonymous ?? false
      }, { transaction });

      await post.increment('comment_count', { by: 1, transaction });

      if (post.user_id !== user_id) {
        await db.Notification.create({
          user_id: post.user_id,
          content: '회원님의 게시물에 새로운 격려 메시지가 도착했습니다.',
          notification_type: 'comment',
          related_id: encouragementMessage.message_id,
          is_read: false
        }, { transaction });
      }

      await transaction.commit();
      return res.status(201).json({
        status: 'success',
        message: '격려 메시지가 성공적으로 전송되었습니다.',
        data: {
          message_id: encouragementMessage.message_id
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('격려 메시지 전송 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '격려 메시지 전송 중 오류가 발생했습니다.'
      });
    }
  }
};

export default someoneDayController;