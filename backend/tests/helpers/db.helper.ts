import { sequelize, User, Emotion, EmotionLog } from '../../models';

export const clearDatabase = async () => {
  try {
    await sequelize.transaction(async (transaction) => {
      await EmotionLog.destroy({ where: {}, truncate: true, cascade: true, transaction });
      await Emotion.destroy({ where: {}, truncate: true, cascade: true, transaction });
      await User.destroy({ where: {}, truncate: true, cascade: true, transaction });
    });
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류:', error);
    throw error;
  }
};

export const createTestUser = async (userData: any) => {
  try {
    return await User.create(userData);
  } catch (error) {
    console.error('테스트 사용자 생성 중 오류:', error);
    throw error;
  }
};

export const createTestEmotion = async (emotionData: any) => {
  try {
    return await Emotion.create(emotionData);
  } catch (error) {
    console.error('테스트 감정 생성 중 오류:', error);
    throw error;
  }
};

export const createTestEmotionLog = async (logData: any) => {
  try {
    return await EmotionLog.create(logData);
  } catch (error) {
    console.error('테스트 감정 로그 생성 중 오류:', error);
    throw error;
  }
};