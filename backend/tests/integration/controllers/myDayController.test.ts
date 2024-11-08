import { authenticatedRequest, createTestUser, baseURL, clearDatabase } from '../../setup';
import db from '../../../models';

describe('MyDay Controller', () => {
  let token: string;
  let user: any;
  let postId: string;

  beforeEach(async () => {
    await clearDatabase();
    const testData = await createTestUser();
    token = testData.token;
    user = testData.user;
  });

  describe('POST /my-day', () => {
    it('should create a new post', async () => {
      const response = await authenticatedRequest(token)
        .post(`${baseURL}/my-day`)
        .send({
          content: '오늘 하루는 정말 특별했습니다. 좋은 일이 많았어요.',
          emotion_ids: [1],
          is_anonymous: false
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('오늘 하루의 기록이 성공적으로 저장되었습니다.');
      expect(response.body.data).toHaveProperty('post_id');
    });

    it('should prevent multiple posts on same day', async () => {
      await authenticatedRequest(token)
        .post(`${baseURL}/my-day`)
        .send({
          content: '첫 번째 포스트',
          emotion_ids: [1]
        });

      const response = await authenticatedRequest(token)
        .post(`${baseURL}/my-day`)
        .send({
          content: '두 번째 포스트',
          emotion_ids: [1]
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('오늘의 게시물은 이미 작성되었습니다.');
    });
  });

  describe('POST /my-day/:id/comments', () => {
    beforeEach(async () => {
      const post = await db.sequelize.models.my_day_posts.create({
        user_id: user.user_id,
        content: '테스트 게시물',
        is_anonymous: false,
        character_count: 13,
        like_count: 0,
        comment_count: 0
      });
      postId = String(post.get('post_id'));  // .post_id를 .get('post_id')로 수정
    });

    it('should create a comment', async () => {
      const response = await authenticatedRequest(token)
        .post(`${baseURL}/my-day/${postId}/comments`)
        .send({
          content: '멋진 하루였네요!',
          is_anonymous: false
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('댓글이 성공적으로 작성되었습니다.');
    });
  });
  describe('POST /my-day/:id/comments', () => {
    beforeEach(async () => {
      const post = await db.sequelize.models.my_day_posts.create({
        user_id: user.user_id,
        content: '테스트 게시물',
        is_anonymous: false,
        character_count: 13,
        like_count: 0,
        comment_count: 0
      });
    });

    it('should toggle like status', async () => {
      const addLike = await authenticatedRequest(token)
        .post(`${baseURL}/my-day/${postId}/like`);

      expect(addLike.status).toBe(200);
      expect(addLike.body.status).toBe('success');
      expect(addLike.body.message).toBe('게시물에 공감을 표시했습니다.');

      const removeLike = await authenticatedRequest(token)
        .post(`${baseURL}/my-day/${postId}/like`);

      expect(removeLike.status).toBe(200);
      expect(removeLike.body.status).toBe('success');
      expect(removeLike.body.message).toBe('게시물 공감을 취소했습니다.');
    });
  });
});