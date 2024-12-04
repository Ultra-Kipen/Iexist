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
  sortBy?: 'latest' | 'popular';  // 기존대로 유지
}

interface ComfortMessageRequest {
  message: string;
}

interface ComfortParams {
  id: string;
}
interface ChallengeParams {
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
 
      const post = await db.SomeoneDayPost.create({
        user_id,
        title: title.trim(),
        content: content.trim(),
        summary: content.substring(0, 200),
        is_anonymous: is_anonymous || false,
        character_count: content.length,
        like_count: 0,
        comment_count: 0
      }, { transaction });
      
      if (emotion_ids && emotion_ids.length > 0) {
        await db.SomeoneDayTag.bulkCreate(
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
  getBestPosts: async (req: AuthRequestGeneric<never, {period?: string}>, res: Response) => {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
  
      const { period = 'weekly' } = req.query;
      const date = new Date();
      
      let startDate: Date;
      switch(period) {
        case 'daily':
          startDate = new Date(date.setDate(date.getDate() - 1));
          break;
        case 'monthly':
          startDate = new Date(date.setMonth(date.getMonth() - 1));
          break;
        case 'weekly':
        default:
          startDate = new Date(date.setDate(date.getDate() - 7));
          break;
      }
  
      const posts = await db.SomeoneDayPost.findAll({
        where: {
          created_at: {
            [Op.gte]: startDate
          }
        },
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['nickname', 'profile_image_url']
        }],
        order: [
          ['like_count', 'DESC'],
          ['comment_count', 'DESC']
        ],
        limit: 10
      });
  
      return res.json({
        status: 'success',
        data: {
          posts: posts.map(post => ({
            ...post.get(),
            user: post.get('is_anonymous') ? null : post.get('user')
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
  getComfortWallPosts: async (req: AuthRequestGeneric<never, ComfortWallQuery>, res: Response) => {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
  
      const { page = '1', limit = '10', emotion, sortBy = 'latest' } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const order: [string, string][] = sortBy === 'popular'
        ? [['comment_count', 'DESC'], ['created_at', 'DESC']]
        : [['created_at', 'DESC']];
  
      const posts = await db.SomeoneDayPost.findAndCountAll({
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['nickname', 'profile_image_url']
          },
          {
            model: db.Tag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['tag_id', 'name']
          }
        ],
        order,
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
// 추가
getChallengeDetails: async (req: AuthRequestGeneric<never, never, ChallengeParams>, res: Response) => {
  const transaction = await db.sequelize.transaction();
  try {
    const challengeId = parseInt(req.params.id, 10);  // string을 number로 변환
    const user_id = req.user?.user_id;

    if (!user_id) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const challenge = await db.Challenge.findOne({
      where: { challenge_id: challengeId },
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['user_id', 'nickname']
        },
        {
          model: db.ChallengeParticipant,
          as: 'participants',
          attributes: ['user_id', 'created_at'],
          include: [
            {
              model: db.User,
              attributes: ['user_id', 'nickname']
            }
          ]
        }
      ],
      transaction
    });

    if (!challenge) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '챌린지를 찾을 수 없습니다.'
      });
    }

    await transaction.commit();
    return res.json({
      status: 'success',
      data: challenge
    });

  } catch (error) {
    await transaction.rollback();
    console.error('챌린지 상세 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '챌린지 상세 조회 중 오류가 발생했습니다.'
    });
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

      const post = await db.SomeoneDayPost.findByPk(postId, { transaction });
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

      const encouragementMessage = await db.EncouragementMessage.create({
        sender_id,
        receiver_id: post.get('user_id'),
        post_id: postId,
        message,
        is_anonymous: false
      }, { transaction });
      
      await post.increment('comment_count', { transaction });

      // 알림 생성
      if (post.get('user_id') !== sender_id) {
        await db.Notification.create({
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