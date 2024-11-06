import request from 'supertest';
import app from '../../app';
import db, { User, Emotion, EmotionLog } from '../../models';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';

// Define interfaces
interface TestUser {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

interface TestEmotion {
  emotion_id?: number;
  name: string;
  icon: string;
}

interface TestEmotionLog {
  user_id: number;
  emotion_id: number;
  note: string;
  log_date: Date;
}

describe('Emotion API Tests', () => {
  let testUser: any;
  let testEmotions: any[];
  let authToken: string;
  let testLog: any;

  beforeAll(async () => {
    await db.testConnection();
    await db.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    // Reset test data
    await EmotionLog.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Emotion.destroy({ where: {}, force: true });

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      nickname: 'Test User'
    } as TestUser);

    // Generate auth token
    authToken = jwt.sign(
      { user_id: testUser.user_id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test emotions
    testEmotions = await Emotion.bulkCreate([{
      emotion_id: 1, // Provide a default value
      name: 'Happy',
      icon: 'emoticon-happy-outline'
    }, {
      emotion_id: 2, // Provide a default value
      name: 'Sad',
      icon: 'emoticon-sad-outline'
    }] as Emotion[]);

    // Create test log
    testLog = await EmotionLog.create({
      log_id: 1, // Provide a default value
      user_id: testUser.user_id,
      emotion_id: testEmotions[0].emotion_id,
      note: 'Test log',
      log_date: new Date()
    } as EmotionLog);
  });

  describe('GET /api/emotions', () => {
    it('should retrieve the list of emotions', async () => {
      const response = await request(app)
        .get('/api/emotions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
    });
  });

  describe('POST /api/emotions/logs', () => {
    it('should create a new emotion log', async () => {
      const newLog = {
        emotion_id: testEmotions[0].emotion_id,
        note: 'New test log'
      };

      const response = await request(app)
        .post('/api/emotions/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newLog);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('log_id');
    });
  });

  describe('GET /api/emotions/logs', () => {
    it('should retrieve the list of emotion logs', async () => {
      const response = await request(app)
        .get('/api/emotions/logs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /api/emotions/logs/:id', () => {
    it('should update an emotion log', async () => {
      const updateData = {
        note: 'Updated log'
      };

      const response = await request(app)
        .put(`/api/emotions/logs/${testLog.log_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.note).toBe(updateData.note);
    });
  });

  describe('DELETE /api/emotions/logs/:id', () => {
    it('should delete an emotion log', async () => {
      const response = await request(app)
        .delete(`/api/emotions/logs/${testLog.log_id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const deletedLog = await EmotionLog.findByPk(testLog.log_id);
      expect(deletedLog).toBeNull();
    });
  });
});