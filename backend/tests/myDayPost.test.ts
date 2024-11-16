import request from 'supertest';
import app from '../app';
import db from '../models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';
export default JWT_SECRET;

const generateToken = (userId: number): string => {
  return jwt.sign({ user_id: userId }, JWT_SECRET, { expiresIn: '1d' });
};

describe('MyDayPost API Tests', () => {
  let token: string;
  let userId: number;
  let postId: number;

  beforeAll(async () => {
    // sequelize.sync 제거
    
    // 기존 사용자 조회
    const user = await db.sequelize.models.users.findOne({
      where: {
        username: 'testuser',
        email: 'test@example.com'
      }
    });

    if (!user) {
      throw new Error('테스트 사용자를 찾을 수 없습니다');
    }
    
    userId = user.get('user_id') as number;
    token = generateToken(userId);

    // emotions 테이블 데이터가 없을 경우에만 생성
    const emotions = await db.sequelize.models.emotions.findAll();
    if (emotions.length === 0) {
      await db.sequelize.models.emotions.bulkCreate([
        { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
        { emotion_id: 2, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4' }
      ]);
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /api/myday', () => {
    it('should create a new post successfully', async () => {
      const response = await request(app)
        .post('/api/myday')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '오늘 하루는 정말 좋은 날이었습니다.',
          emotion_ids: [1],
          is_anonymous: false
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('post_id');
      
      postId = response.body.data.post_id;
    });

    it('should not allow creating multiple posts in one day', async () => {
      const response = await request(app)
        .post('/api/myday')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '두 번째 게시물입니다.',
          emotion_ids: [1],
          is_anonymous: false
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('오늘의 게시물은 이미 작성되었습니다.');
    });
  });

  describe('GET /api/myday', () => {
    it('should get list of posts', async () => {
      const response = await request(app)
        .get('/api/myday')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.posts)).toBe(true);
    });
  });

  describe('POST /api/myday/:id/comments', () => {
    it('should add a comment to a post', async () => {
      const response = await request(app)
        .post(`/api/myday/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '좋은 하루 보내셨네요!',
          is_anonymous: false
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('comment_id');
    });
  });

  describe('POST /api/myday/:id/likes', () => {
    it('should like a post', async () => {
      const response = await request(app)
        .post(`/api/myday/${postId}/likes`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('게시물에 좋아요를 표시했습니다.');
    });

    it('should unlike a post when liked twice', async () => {
      const response = await request(app)
        .post(`/api/myday/${postId}/likes`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('게시물 좋아요를 취소했습니다.');
    });
  });
});