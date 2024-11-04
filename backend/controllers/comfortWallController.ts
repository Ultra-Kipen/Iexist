import { Response, Request } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequest, PaginationQuery, AuthUser } from '../types/express';

interface SomeoneDayPost {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  is_anonymous: boolean;
  comment_count: number;
  User: {
    nickname: string;
    profile_image_url: string;
  } | null;
  EncouragementMessages: Array<{
    message_id: number;
    message: string;
    User: {
      nickname: string;
    };
    created_at: Date;
  }>;
  created_at: Date;
  updated_at: Date;
  toJSON(): any;
}


interface ComfortWallPost {
  title: string;
  content: string;
  is_anonymous?: boolean;
  emotion_ids?: number[];
}

interface ComfortWallQuery extends PaginationQuery {
  emotion?: string;
  sortBy?: 'latest' | 'popular';
}

interface ComfortParams {
  id: string;
}
interface ComfortParams {
  id: string;
}

interface ComfortMessageRequest {
  message: string;
}
const comfortWallController = {
  createComfortWallPost: async (
    req: Request & { user?: AuthUser },
    res: Response
  ) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { title, content, is_anonymous, emotion_ids } = req.body as ComfortWallPost;
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }

      if (!title || title.length < 5 || title.length > 100) {
        await transaction.rollback();
        return res.status(400).json({ message: '제목은 5자 이상 100자 이하여야 합니다.' });
      }

      if (!content || content.length < 20 || content.length > 2000) {
        await transaction.rollback();
        return res.status(400).json({ message: '게시물 내용은 20자 이상 2000자 이하여야 합니다.' });
      }

      const post = await db.SomeoneDayPost.create({
        user_id,
        title,
        content,
        is_anonymous: is_anonymous || false,
        character_count: content.length,
        summary: content.slice(0, 200)
      }, { transaction });
      
      if (emotion_ids && emotion_ids.length > 0) {
        await db.SomeoneDayTag.bulkCreate(
          emotion_ids.map((tag_id: number) => ({
            post_id: post.post_id,
            tag_id
          })), 
          { transaction }
        );
      }

      await transaction.commit();
      res.status(201).json({
        message: "위로와 공감 게시물이 성공적으로 생성되었습니다.",
        post_id: post.post_id
      });
    } catch (error) {
      await transaction.rollback();
      console.error('위로와 공감 게시물 생성 오류:', error);
      res.status(500).json({ message: '게시물 생성 중 오류가 발생했습니다.' });
    }
  },

  
  getComfortWallPosts: async (
    req: Request & { user?: AuthUser } & { query: ComfortWallQuery },
    res: Response
  ) => {
    try {
      const { page = '1', limit = '10', emotion, sortBy = 'latest' } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const whereClause: any = {};
      if (emotion) {
        whereClause['$Emotions.name$'] = emotion;
      }

      const orderClause = sortBy === 'popular' 
        ? [['comment_count', 'DESC'], ['created_at', 'DESC']] as [string, string][]
        : [['created_at', 'DESC']] as [string, string][];
      
        const posts = await db.SomeoneDayPost.findAndCountAll({
          where: whereClause,
          include: [
            {
              model: db.User,
              attributes: ['nickname', 'profile_image_url'],
              where: { user_id: { [Op.ne]: req.user?.id } }
            },
            {
              model: db.Emotion,
              through: { attributes: [] },
              attributes: ['name', 'icon']
            },
            {
              model: db.EncouragementMessage,
              separate: true,
              limit: 3,
              order: [['created_at', 'DESC']] as [string, string][],
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
    
        const formattedPosts = posts.rows.map((post) => {
          const postData = post.toJSON();
          return {
            ...postData,
            User: postData.is_anonymous ? null : postData.User,
            encouragement_message: postData.EncouragementMessages?.slice(0, 3) || [],
            total_comments: postData.comment_count
          };
        });
  
        res.json({
          posts: formattedPosts,
          totalPages: Math.ceil(posts.count / Number(limit)),
          currentPage: Number(page),
          totalCount: posts.count
        });
      } catch (error) {
        console.error('위로와 공감 게시물 조회 오류:', error);
        res.status(500).json({ message: '게시물 조회 중 오류가 발생했습니다.' });
      }
    },
    createComfortMessage: async (
      req: Request<ComfortParams, any, ComfortMessageRequest> & { user?: AuthUser },
      res: Response
    ) => {
      const transaction = await db.sequelize.transaction();
      try {
        const { message } = req.body;
        const postId = Number(req.params.id);
        const sender_id = req.user?.id;
  
        if (!sender_id) {
          await transaction.rollback();
          return res.status(401).json({ message: '인증이 필요합니다.' });
        }
  
        const post = await db.SomeoneDayPost.findByPk(postId, { transaction });
        if (!post) {
          await transaction.rollback();
          return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
        }
  
        if (post.user_id === sender_id) {
          await transaction.rollback();
          return res.status(400).json({ message: '자신의 게시물에는 위로 메시지를 보낼 수 없습니다.' });
        }
  
        if (!message || message.length < 5 || message.length > 500) {
          await transaction.rollback();
          return res.status(400).json({ message: '위로의 메시지는 5자 이상 500자 이하여야 합니다.' });
        }

        const encouragementMessage = await db.EncouragementMessage.create({
          sender_id,
          receiver_id: post.user_id,
          post_id: postId,
          message
        }, { transaction });
        
        await post.increment('comment_count', { transaction });
        
        await transaction.commit();
        res.status(201).json({
          message: "위로의 메시지가 성공적으로 전송되었습니다.",
          encouragement_message_id: encouragementMessage.get('message_id')
        });
      } catch (error) {
        await transaction.rollback();
        console.error('위로의 메시지 전송 오류:', error);
        res.status(500).json({ message: '위로의 메시지 전송 중 오류가 발생했습니다.' });
      }
    }
  };
  

export default comfortWallController;