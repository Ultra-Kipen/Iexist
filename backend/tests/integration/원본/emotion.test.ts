import request from 'supertest';
import app from '../../app';
import db from '../../models';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';

describe('Emotion API Tests', () => {
  let testUser: any;
  let testEmotions: any[];
  let authToken: string;
  let testLog: any;

  beforeEach(async () => {
    // Reset test data
    await db.sequelize.models.emotion_logs.destroy({ where: {}, force: true });
    await db.sequelize.models.users.destroy({ where: {}, force: true });
    await db.sequelize.models.emotions.destroy({ where: {}, force: true });

    // Create test user
    testUser = await db.sequelize.models.users.create({
      username: 'testuser',
      email: 'test@example.com', 
      password: 'password123',
      nickname: 'Test User'
    });

    // Generate auth token
    authToken = jwt.sign(
      { user_id: testUser.get('user_id') },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test emotions  
    testEmotions = await db.sequelize.models.emotions.bulkCreate([{
      emotion_id: 1,
      name: 'Happy',
      icon: 'emoticon-happy-outline'
    }, {
      emotion_id: 2, 
      name: 'Sad',
      icon: 'emoticon-sad-outline'
    }]);

    // Create test log
    testLog = await db.sequelize.models.emotion_logs.create({
      user_id: testUser.get('user_id'),
      emotion_id: testEmotions[0].get('emotion_id'),
      note: 'Test log',
      log_date: new Date()
    });
  });

  describe('GET /api/emotions', () => {
    it('should retrieve the list of emotions', async () => {
      const response = await request(app)
        .get('/api/emotions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/emotions/logs', () => {
    it('should create a new emotion log', async () => {
      const newLog = {
        emotion_id: testEmotions[0].get('emotion_id'),
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
        .put(`/api/emotions/logs/${testLog.get('log_id')}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.note).toBe(updateData.note);
    });
  });

  describe('DELETE /api/emotions/logs/:id', () => {
    it('should delete an emotion log', async () => {
      const response = await request(app)
        .delete(`/api/emotions/logs/${testLog.get('log_id')}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const deletedLog = await db.sequelize.models.emotion_logs.findByPk(testLog.get('log_id'));
      expect(deletedLog).toBeNull();
    });
  });

  describe('GET /api/emotions/:id', () => {
    it('should retrieve a single emotion by ID', async () => {
      const response = await request(app)
        .get(`/api/emotions/${testEmotions[0].get('emotion_id')}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('emotion_id', testEmotions[0].get('emotion_id'));
    });
  });

  describe('POST /api/emotions', () => {
    it('should create a new emotion', async () => {
      const newEmotion = {
        name: 'Excited',
        icon: 'emoticon-excited-outline'
      };

      const response = await request(app)
        .post('/api/emotions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newEmotion);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('emotion_id');
    });
  });

  describe('PUT /api/emotions/:id', () => {
    it('should update an emotion', async () => {
      const updateData = {
        name: 'Very Happy'
      };

      const response = await request(app)
        .put(`/api/emotions/${testEmotions[0].get('emotion_id')}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/emotions/:id', () => {
    it('should delete an emotion', async () => {
      const response = await request(app)
        .delete(`/api/emotions/${testEmotions[0].get('emotion_id')}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const deletedEmotion = await db.sequelize.models.emotions.findByPk(testEmotions[0].get('emotion_id'));
      expect(deletedEmotion).toBeNull();
    });
  });
});