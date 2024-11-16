// tests/integration/comment.test.ts

import request from 'supertest'; 
import app from '../../app';
import db from '../../models';
import jwt from 'jsonwebtoken';

describe('댓글 API 테스트', () => {
 let authToken: string;
 let post: any;
 let user: any;

 beforeAll(async () => {
   // 기존 사용자 조회
   user = await db.sequelize.models.users.findOne({
     where: {
       username: 'testuser',
       email: 'test@example.com'  
     }
   });

   if (!user) {
     throw new Error('테스트 사용자가 존재하지 않습니다');
   }

   authToken = jwt.sign(
     { user_id: user.get('user_id') },
     process.env.JWT_SECRET || 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=',
     { expiresIn: '1h' }
   );

   // 테스트용 게시물 생성
   post = await db.sequelize.models.my_day_posts.create({
     user_id: user.get('user_id'),
     content: '댓글 테스트용 게시물입니다.',
     emotion_summary: '테스트 감정',
     is_anonymous: false,
     character_count: 17,
     like_count: 0,
     comment_count: 0
   });
 });

 afterAll(async () => {
   // 테스트 게시물 삭제
   await db.sequelize.models.my_day_posts.destroy({
     where: { post_id: post.get('post_id') }
   });
 });

 describe('댓글 작성 테스트 (/api/posts/:id/comments)', () => {
   it('댓글이 성공적으로 작성되어야 함', async () => {
     const commentData = {
       content: '테스트 댓글입니다.',
       is_anonymous: false
     };

     const response = await request(app)
       .post(`/api/posts/${post.get('post_id')}/comments`)
       .set('Authorization', `Bearer ${authToken}`)
       .send(commentData);

     expect(response.status).toBe(201);
     expect(response.body.status).toBe('success');
     expect(response.body.data).toHaveProperty('comment_id');

     // 생성된 테스트 댓글 삭제
     if (response.body.data.comment_id) {
       await db.sequelize.models.my_day_comments.destroy({
         where: { comment_id: response.body.data.comment_id }
       });
     }
   });
 });

 describe('댓글 조회 테스트 (/api/posts/:id/comments)', () => {
   it('게시물의 댓글 목록을 조회할 수 있어야 함', async () => {
     const response = await request(app)
       .get(`/api/posts/${post.get('post_id')}/comments`)
       .set('Authorization', `Bearer ${authToken}`);

     expect(response.status).toBe(200);
     expect(response.body.status).toBe('success');
     expect(Array.isArray(response.body.data.comments)).toBe(true);
   });
 });

 describe('댓글 작성 유효성 검사', () => {
   it('빈 내용의 댓글 작성 시 실패해야 함', async () => {
     const commentData = {
       content: '',
       is_anonymous: false
     };

     const response = await request(app)
       .post(`/api/posts/${post.get('post_id')}/comments`)
       .set('Authorization', `Bearer ${authToken}`)
       .send(commentData);

     expect(response.status).toBe(400);
     expect(response.body.status).toBe('error');
   });

   it('너무 긴 내용의 댓글 작성 시 실패해야 함', async () => {
     const commentData = {
       content: 'a'.repeat(501),
       is_anonymous: false
     };

     const response = await request(app)
       .post(`/api/posts/${post.get('post_id')}/comments`)
       .set('Authorization', `Bearer ${authToken}`)
       .send(commentData);

     expect(response.status).toBe(400);
     expect(response.body.status).toBe('error');
   });
 });
});