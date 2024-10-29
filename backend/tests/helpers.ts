import { sequelize } from '../models';

export const setupTestDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('테스트 데이터베이스 설정 실패:', error);
    throw error;
  }
};

export const clearTestDB = async () => {
  try {
    await sequelize.drop();
  } catch (error) {
    console.error('테스트 데이터베이스 정리 실패:', error);
    throw error;
  }
};