import { Response } from 'express';
import db from '../models';
import { AuthRequest } from '../types/express';

interface NotificationQuery {
  page?: string;
  limit?: string;
  type?: 'like' | 'comment' | 'challenge' | 'system';
  is_read?: string;
}

interface NotificationUpdate {
  is_read: boolean;
}

const notificationController = {
  getNotifications: async (req: AuthRequest<never, NotificationQuery>, res: Response) => {
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
        type,
        is_read 
      } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);

      const whereClause: any = { user_id };
      
      if (type) {
        whereClause.notification_type = type;
      }
      
      if (is_read !== undefined) {
        whereClause.is_read = is_read === 'true';
      }

      const notifications = await db.Notification.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset,
        attributes: [
          'notification_id',
          'content',
          'notification_type',
          'is_read',
          'created_at',
          'related_id'
        ]
      });

      res.json({
        status: 'success',
        data: {
          notifications: notifications.rows,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(notifications.count / Number(limit)),
            total_count: notifications.count,
            has_next: offset + Number(limit) < notifications.count
          }
        }
      });
    } catch (error) {
      console.error('알림 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '알림 조회 중 오류가 발생했습니다.'
      });
    }
  },

  markNotificationAsRead: async (req: AuthRequest<NotificationUpdate>, res: Response) => {
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

      const notification = await db.Notification.findOne({
        where: { 
          notification_id: id,
          user_id 
        },
        transaction
      });

      if (!notification) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '알림을 찾을 수 없습니다.'
        });
      }

      notification.is_read = true;
      await notification.save({ transaction });

      await transaction.commit();
      res.json({
        status: 'success',
        message: '알림이 읽음 처리되었습니다.'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('알림 읽음 처리 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '알림 읽음 처리 중 오류가 발생했습니다.'
      });
    }
  },

  deleteNotification: async (req: AuthRequest, res: Response) => {
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

      const result = await db.Notification.destroy({
        where: { 
          notification_id: id, 
          user_id 
        },
        transaction
      });

      if (result === 0) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '알림을 찾을 수 없습니다.'
        });
      }

      await transaction.commit();
      res.json({
        status: 'success',
        message: '알림이 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('알림 삭제 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '알림 삭제 중 오류가 발생했습니다.'
      });
    }
  },

  markAllAsRead: async (req: AuthRequest, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      await db.Notification.update(
        { is_read: true },
        { 
          where: { 
            user_id,
            is_read: false 
          },
          transaction 
        }
      );

      await transaction.commit();
      res.json({
        status: 'success',
        message: '모든 알림이 읽음 처리되었습니다.'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('전체 알림 읽음 처리 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '전체 알림 읽음 처리 중 오류가 발생했습니다.'
      });
    }
  }
};

export default notificationController;