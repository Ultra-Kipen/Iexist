import { Response } from 'express';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequestGeneric } from '../types/express';

interface ComfortWallPost {
  title: string;
  content: string;
  is_anonymous?: boolean;
  emotion_ids?: number[];
}

interface ComfortWallQuery {
  page?: string;
  limit?: string;
  emotion?: string;
  sortBy?: 'latest' | 'popular';
}

interface ComfortMessageRequest {
  message: string;
}

interface ComfortParams {
  id: string;
}

const comfortWallController = {
  createComfortWallPost: async (
    req: AuthRequestGeneric<ComfortWallPost>,
    res: Response
  ) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { title, content, is_anonymous, emotion_ids } = req.body;
      const user_id = req.user?.user_id;

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

      const post = await db.sequelize.models.someone_day_posts.create({
        user_id,
        title,
        content,
        is_anonymous: is_anonymous || false,
        character_count: content.length,
        summary: content.slice(0, 200),
        like_count: 0,
        comment_count: 0
      }, { transaction });
      
      if (emotion_ids && emotion_ids.length > 0) {
        await db.sequelize.models.someone_day_tags.bulkCreate(
          emotion_ids.map((tag_id: number) => ({
            post_id: post.get('post_id'),
            tag_id
          })), 
          { transaction }
        );
      }

      await transaction.commit();
      return res.status(201).json({
        message: "위로와 공감 게시물이 성공적으로 생성되었습니다.",
        post_id: post.get('post_id')
      });
    } catch (error) {
      await transaction.rollback();
      console.error('위로와 공감 게시물 생성 오류:', error);
      return res.status(500).json({ message: '게시물 생성 중 오류가 발생했습니다.' });
    }
  },

  getComfortWallPosts: async (
    req: AuthRequestGeneric<never, ComfortWallQuery>,
    res: Response
  ) => {
    try {
      const { page = '1', limit = '10', emotion, sortBy = 'latest' } = req.query;
      const user_id = req.user?.user_id;
      const offset = (Number(page) - 1) * Number(limit);
  
      const whereClause: any = {};
      if (emotion) {
        whereClause['$emotions.name$'] = emotion;
      }

      const orderClause = sortBy === 'popular' 
      ? [['comment_count', 'DESC'], ['created_at', 'DESC']] as const
      : [['created_at', 'DESC']] as const;
      
      const posts = await db.sequelize.models.someone_day_posts.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.sequelize.models.users,
            attributes: ['nickname', 'profile_image_url'],
            where: user_id ? { user_id: { [Op.ne]: user_id } } : undefined
          },
          {
            model: db.sequelize.models.emotions,
            through: { attributes: [] },
            attributes: ['name', 'icon']
          },
          {
            model: db.sequelize.models.encouragement_messages,
            separate: true,
            limit: 3,
            order: [['createdAt', 'DESC']], // 수정된 부분
            include: [{
              model: db.sequelize.models.users,
              attributes: ['nickname']
            }]
          }
        ],
        order: [
          ...(sortBy === 'popular' 
            ? [['comment_count', 'DESC'], ['created_at', 'DESC']]
            : [['created_at', 'DESC']]
          )
        ] as [string, string][],
        limit: Number(limit),
        offset,
        distinct: true
      });

    const formattedPosts = posts.rows.map((post: any) => {
      const postData = post.get();
      const encouragementMessages = post.get('encouragement_messages') || [];
      
      return {
        ...postData,
        User: postData.is_anonymous ? null : post.get('User'),
        encouragement_message: encouragementMessages.length > 3 
          ? encouragementMessages.slice(0, 3) 
          : encouragementMessages,
        total_comments: post.get('comment_count')
      };
    });

    return res.json({
      posts: formattedPosts,
      totalPages: Math.ceil(posts.count / Number(limit)),
      currentPage: Number(page),
      totalCount: posts.count
    });
  } catch (error) {
    console.error('위로와 공감 게시물 조회 오류:', error);
    return res.status(500).json({ message: '게시물 조회 중 오류가 발생했습니다.' });
  }
},

  createComfortMessage: async (
    req: AuthRequestGeneric<ComfortMessageRequest, never, ComfortParams>,
    res: Response
  ) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { message } = req.body;
      const postId = Number(req.params.id);
      const sender_id = req.user?.user_id;

      if (!sender_id) {
        await transaction.rollback();
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }

      const post = await db.sequelize.models.someone_day_posts.findByPk(postId, { transaction });
      if (!post) {
        await transaction.rollback();
        return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
      }

      if (post.get('user_id') === sender_id) {
        await transaction.rollback();
        return res.status(400).json({ message: '자신의 게시물에는 위로 메시지를 보낼 수 없습니다.' });
      }

      if (!message || message.length < 5 || message.length > 500) {
        await transaction.rollback();
        return res.status(400).json({ message: '위로의 메시지는 5자 이상 500자 이하여야 합니다.' });
      }

      const encouragementMessage = await db.sequelize.models.encouragement_messages.create({
        sender_id,
        receiver_id: post.get('user_id'),
        post_id: postId,
        message,
        is_anonymous: false
      }, { transaction });
      
      await post.increment('comment_count', { transaction });

      // 알림 생성
      if (post.get('user_id') !== sender_id) {
        await db.sequelize.models.notifications.create({
          user_id: post.get('user_id'),
          content: '회원님의 게시물에 새로운 위로의 메시지가 도착했습니다.',
          notification_type: 'comment' as const,  // 타입 명시
          related_id: encouragementMessage.get('message_id'),
          is_read: false
        }, { transaction });
      }
      
      await transaction.commit();
      return res.status(201).json({
        message: "위로의 메시지가 성공적으로 전송되었습니다.",
        encouragement_message_id: encouragementMessage.get('message_id')
      });
    } catch (error) {
      await transaction.rollback();
      console.error('위로의 메시지 전송 오류:', error);
      return res.status(500).json({ message: '위로의 메시지 전송 중 오류가 발생했습니다.' });
    }
  }
};

export default comfortWallController;