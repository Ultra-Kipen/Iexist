import { EmotionService } from '../../services/EmotionService';
import db from '../../models';
import { EmotionCreateDTO } from '../../types/emotion';
import { sequelize, transaction } from '../setup';

describe('EmotionService', () => {
  let emotionService: EmotionService = new EmotionService();

  beforeEach(async () => {
    emotionService = new EmotionService();

    // 테스트를 위한 초기 감정 데이터 생성
    await db.Emotion.bulkCreate([
      {
        emotion_id: 1,
        name: '행복',
        icon: 'emoticon-happy-outline',
        color: '#FFD700'
      },
      {
        emotion_id: 2,
        name: '슬픔',
        icon: 'emoticon-sad-outline',
        color: '#4682B4'
      }
    ], {
      ignoreDuplicates: true,
      transaction
    });
  });

  afterEach(async () => {
    // 더 이상 transaction.rollback()을 호출하지 않습니다.
  });

  it('createEmotion should create emotion logs', async () => {
    const mockData: EmotionCreateDTO = {
      emotion_ids: [1, 2],
      note: '테스트 감정'
    };
    const userId = 1;

    await db.EmotionLog.destroy({
      where: { user_id: userId },
      transaction
    });

    const result = await emotionService.createEmotion(mockData, userId, transaction);
    expect(result.status).toBe('success');

    const logs = await db.EmotionLog.findAll({
      where: { user_id: userId },
      transaction
    });

    expect(logs.length).toBe(2);
  });

  it('should get emotion statistics', async () => {
    const userId = 1;
    const today = new Date();

    // 기존 데이터 정리
    await db.EmotionLog.destroy({
      where: { user_id: userId },
      transaction
    });

    // 테스트 데이터 생성
    const emotionLogs = await db.EmotionLog.bulkCreate([
      {
        user_id: userId,
        emotion_id: 1,
        log_date: today,
        note: '테스트1'
      },
      {
        user_id: userId,
        emotion_id: 2,
        log_date: today,
        note: '테스트2'
      }
    ], {
      transaction,
      validate: true
    });

    expect(emotionLogs.length).toBe(2);

    const stats = await emotionService.getEmotionStats(userId, today, today, transaction);

    expect(stats).toBeDefined();
    expect(typeof stats).toBe('object');
    const dateKey = today.toISOString().split('T')[0];
    expect(stats[dateKey]).toBeDefined();
    expect(stats[dateKey].emotions).toBeDefined();
  });
});