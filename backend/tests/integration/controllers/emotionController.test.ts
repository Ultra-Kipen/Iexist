import { authenticatedRequest, createTestUser, baseURL } from '../../setup';
import { sequelize } from '../../../config/database';

describe('Emotion Controller', () => {
  let token: string;
  let user: any;

  beforeEach(async () => {
    const testData = await createTestUser();
    token = testData.token;
    user = testData.user;

    // 테스트용 감정 데이터 생성
    await sequelize.models.emotions.bulkCreate([
      { name: '행복', icon: 'emoticon-happy-outline' },
      { name: '슬픔', icon: 'emoticon-sad-outline' },
      { name: '분노', icon: 'emoticon-angry-outline' }
    ]);
  });

  describe('GET /emotions', () => {
    it('should get all emotions', async () => {
      const response = await authenticatedRequest(token)
        .get(`${baseURL}/emotions`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);  // 추가한 감정 데이터 수와 일치
    });
  });

  describe('POST /emotions/log', () => {
    it('should create emotion log', async () => {
      const response = await authenticatedRequest(token)
        .post(`${baseURL}/emotions/log`)
        .send({
          emotion_ids: [1],  // 위에서 생성한 감정 ID
          note: '오늘은 행복한 하루였습니다.'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('감정이 성공적으로 기록되었습니다.');
    });

    it('should prevent multiple emotion logs on same day', async () => {
      // 첫 번째 감정 로그 생성
      await authenticatedRequest(token)
        .post(`${baseURL}/emotions/log`)
        .send({
          emotion_ids: [1],
          note: '첫 번째 기록'
        });

      // 같은 날 두 번째 감정 로그 시도
      const response = await authenticatedRequest(token)
        .post(`${baseURL}/emotions/log`)
        .send({
          emotion_ids: [2],
          note: '두 번째 기록'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('오늘의 감정은 이미 기록되었습니다.');
    });

    it('should return error for invalid emotion IDs', async () => {
      const response = await authenticatedRequest(token)
        .post(`${baseURL}/emotions/log`)
        .send({
          emotion_ids: [999],  // 존재하지 않는 감정 ID
          note: '유효하지 않은 감정 ID 테스트'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('유효하지 않은 감정이 포함되어 있습니다.');
    });
  });

  describe('GET /emotions/stats', () => {
    beforeEach(async () => {
      // 테스트용 감정 로그 데이터 생성
      await sequelize.models.emotion_logs.create({
        user_id: user.get('user_id'),
        emotion_id: 1,
        note: '테스트 로그',
        log_date: new Date()
      });
    });

    it('should get emotion statistics', async () => {
      const response = await authenticatedRequest(token)
        .get(`${baseURL}/emotions/stats`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('basic_stats');
      expect(response.body.data).toHaveProperty('emotion_stats');
    });

    it('should return error for unauthorized access', async () => {
      const response = await authenticatedRequest('')
        .get(`${baseURL}/emotions/stats`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('인증이 필요합니다.');
    });
  });

  describe('GET /emotions/trends', () => {
    beforeEach(async () => {
      // 테스트용 감정 로그 데이터 생성
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        new Date('2024-01-03')
      ];

      for (const date of dates) {
        await sequelize.models.emotion_logs.create({
          user_id: user.get('user_id'),
          emotion_id: 1,
          note: '테스트 로그',
          log_date: date
        });
      }
    });

    it('should get emotion trends', async () => {
      const response = await authenticatedRequest(token)
        .get(`${baseURL}/emotions/trends`)
        .query({
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          type: 'monthly'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('trends');
      expect(Array.isArray(response.body.data.trends)).toBe(true);
    });

    it('should return error for unauthorized access', async () => {
      const response = await authenticatedRequest('')
        .get(`${baseURL}/emotions/trends`)
        .query({
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          type: 'monthly'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('인증이 필요합니다.');
    });
  });
});