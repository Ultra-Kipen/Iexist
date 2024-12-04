import { Op, Transaction } from 'sequelize';
import db from '../models';
import { EmotionCreateDTO, EmotionResponseDTO } from '../types/emotion';

export class EmotionService {
  async createEmotion(data: EmotionCreateDTO, userId: number, transaction?: Transaction): Promise<EmotionResponseDTO> {
    try {
      const { emotion_ids, note } = data;

      if (!emotion_ids?.length) {
        throw new Error('하나 이상의 감정을 선택해주세요.');
      }

      const validEmotions = await db.Emotion.findAll({
        where: { emotion_id: emotion_ids },
        transaction
      });

      if (validEmotions.length !== emotion_ids.length) {
        throw new Error('유효하지 않은 감정이 포함되어 있습니다.');
      }

      const emotionLogs = await db.EmotionLog.bulkCreate(
        emotion_ids.map(emotion_id => ({
          user_id: userId,
          emotion_id,
          log_date: new Date(),
          note: note?.trim() || null
        })),
        { transaction, returning: true }
      );

      await transaction.commit();

      return {
        status: 'success',
        message: '감정이 성공적으로 기록되었습니다.',
        data: emotionLogs.map(log => log.get())
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getEmotionStats(userId: number, startDate?: Date, endDate?: Date, transaction?: Transaction): Promise<any> {
    try {
      const whereClause: any = { user_id: userId };

      if (startDate && endDate) {
        whereClause.log_date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const stats = await db.EmotionLog.findAll({
        where: whereClause,
        include: [{
          model: db.Emotion,
          attributes: ['name', 'icon'],
          required: true
        }],
        transaction,
        attributes: [
          'log_date',
          [db.sequelize.fn('COUNT', db.sequelize.col('emotion_id')), 'count']
        ],
        group: ['log_date', 'Emotion.name', 'Emotion.icon'],
        raw: true
      });

      await transaction.commit();

      return this.formatEmotionStats(stats);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private formatEmotionStats(stats: any[]): any {
    return stats.reduce((acc: any, curr: any) => {
      const date = new Date(curr.log_date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          emotions: []
        };
      }
      acc[date].emotions.push({
        name: curr['Emotion.name'],
        icon: curr['Emotion.icon'],
        count: parseInt(curr.count)
      });
      return acc;
    }, {});
  }
}