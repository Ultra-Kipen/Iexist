import request from 'supertest';
import app from '../../app';
import db, { User, Emotion, EmotionLog } from '../../models';
import { EmotionAttributes } from '../../models/Emotion';

describe('감정 API 테스트', () => {
  let testUser: any;
  let testEmotions: EmotionAttributes[];

  beforeAll(async () => {
    await db.testConnection();
    await db.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    // 테스트용 사용자 생성
    testUser = await User.create({
      username: 'testuser',
      email: 'test@test.com',
      password: 'hashedPassword123'
    });

    // 테스트용 감정 데이터 생성
    testEmotions = await Emotion.bulkCreate([
      {
        name: '행복',
        description: '행복한 감정',
        icon: 'emoticon-happy-outline'
      },
      {
        name: '슬픔',
        description: '슬픈 감정',
        icon: 'emoticon-sad-outline'
      }
    ]);
  });

  afterEach(async () => {
    await EmotionLog.destroy({ where: {}, force: true });
    await Emotion.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  describe('감정 기록 생성 테스트', () => {
    it('유효한 데이터로 감정 기록 생성 시 201 응답', async () => {
      const emotionLog = {
        user_id: testUser.id,
        emotion_id: testEmotions[0].emotion_id,
        note: '오늘은 행복한 하루였어요',
        log_date: new Date()
      };

      const response = await request(app)
        .post('/api/emotions/logs')
        .send(emotionLog);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('log_id');
      expect(response.body.note).toBe(emotionLog.note);
    });

    it('필수 필드 누락 시 400 응답', async () => {
      const response = await request(app)
        .post('/api/emotions/logs')
        .send({ note: '테스트' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('사용자 ID와 감정 ID는 필수 입력 항목입니다.');
    });
  });

  describe('감정 기록 조회 테스트', () => {
    beforeEach(async () => {
      await EmotionLog.bulkCreate([
        {
          user_id: testUser.id,
          emotion_id: testEmotions[0].emotion_id,
          note: '행복한 하루',
          log_date: new Date()
        },
        {
          user_id: testUser.id,
          emotion_id: testEmotions[1].emotion_id,
          note: '평온한 하루',
          log_date: new Date()
        }
      ]);
    });

    it('특정 사용자의 감정 기록 목록 조회', async () => {
      const response = await request(app)
        .get(`/api/emotions/logs/user/${testUser.id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('log_id');
      expect(response.body[0]).toHaveProperty('emotion_id');
      expect(response.body[0]).toHaveProperty('user_id');
    });

    it('기간별 감정 기록 조회', async () => {
      const response = await request(app)
        .get(`/api/emotions/logs/user/${testUser.id}`)
        .query({
          start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
    });
  });

  describe('감정 통계 테스트', () => {
    beforeEach(async () => {
      await EmotionLog.bulkCreate([
        {
          user_id: testUser.id,
          emotion_id: testEmotions[0].emotion_id,
          note: '행복 기록 1',
          log_date: new Date()
        },
        {
          user_id: testUser.id,
          emotion_id: testEmotions[0].emotion_id,
          note: '행복 기록 2',
          log_date: new Date()
        },
        {
          user_id: testUser.id,
          emotion_id: testEmotions[1].emotion_id,
          note: '슬픔 기록',
          log_date: new Date()
        }
      ]);
    });

    it('사용자의 감정 통계 조회', async () => {
      const response = await request(app)
        .get(`/api/emotions/logs/stats/${testUser.id}`)
        .query({
          start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('most_frequent_emotion');
      expect(response.body.most_frequent_emotion).toBe(testEmotions[0].emotion_id);
      expect(response.body.total_logs).toBe(3);
    });
  });

  describe('감정 기록 수정/삭제 테스트', () => {
    let testEmotionLog: any;

    beforeEach(async () => {
      testEmotionLog = await EmotionLog.create({
        user_id: testUser.id,
        emotion_id: testEmotions[0].emotion_id,
        note: '원래 내용',
        log_date: new Date()
      });
    });

    it('유효한 데이터로 감정 기록 수정', async () => {
      const updateData = {
        note: '수정된 내용',
        emotion_id: testEmotions[1].emotion_id
      };

      const response = await request(app)
        .put(`/api/emotions/logs/${testEmotionLog.log_id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.note).toBe(updateData.note);
      expect(response.body.emotion_id).toBe(updateData.emotion_id);
    });

    it('존재하는 ID로 삭제 시 성공', async () => {
      const response = await request(app)
        .delete(`/api/emotions/logs/${testEmotionLog.log_id}`);

      expect(response.status).toBe(204);

      const deletedLog = await EmotionLog.findByPk(testEmotionLog.log_id);
      expect(deletedLog).toBeNull();
    });
  });
});