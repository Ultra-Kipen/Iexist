// myDay.ts 수정 
import { Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { createPost, getPosts, getMyPosts, createComment, likePost, deletePost } from '../controllers/myDayController';
import { AuthRequestGeneric } from '../types/express';

interface MyDayQuery {
  page?: string;
  limit?: string;
  sort_by?: 'latest' | 'popular';
  start_date?: string;
  end_date?: string;
}
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware'; 
const expressValidator = require('express-validator');
const { body, query, param } = expressValidator;  // param 추가

const router = Router();
interface PostParams extends ParamsDictionary {
  id: string;
}

/**
* @swagger
* /my-day/posts:
*   post:
*     summary: 나의 하루 게시물 생성
*     tags: [MyDay]
*     security:
*       - bearerAuth: []
*/
router.post('/posts',
 authMiddleware,
 validateRequest([
   body('content').isLength({ min: 10, max: 1000 })
     .withMessage('내용은 10자 이상 1000자 이하여야 합니다.'),
   body('emotion_ids').optional().isArray()
     .withMessage('감정 ID는 배열이어야 합니다.'),
   body('is_anonymous').optional().isBoolean()
     .withMessage('익명 여부는 boolean 값이어야 합니다.')
 ]),
 createPost
);

/**
* @swagger
* /my-day/posts:
*   get:
*     summary: 나의 하루 게시물 목록 조회 
*     tags: [MyDay]
*     security:
*       - bearerAuth: []
*/
// 올바른 경로 수정
router.get('/posts', 
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 }).withMessage('page는 1 이상의 정수여야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit는 1에서 100 사이의 정수여야 합니다.'),
    query('sort_by').optional().isIn(['latest', 'popular']).withMessage('정렬 기준이 올바르지 않습니다.'), 
    query('start_date').optional().isDate().withMessage('시작 날짜 형식이 올바르지 않습니다.'),
    query('end_date').optional().isDate().withMessage('종료 날짜 형식이 올바르지 않습니다.')
  ]),
  (req, res, next) => {
    const typedReq = req as unknown as AuthRequestGeneric<never, MyDayQuery>;
    return getPosts(typedReq, res).catch(next);
  }
);
// 내 게시물 목록 조회는 별도 엔드포인트로 분리
router.get('/posts/me',
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 }).withMessage('page는 1 이상의 정수여야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit는 1에서 100 사이의 정수여야 합니다.')
  ]),
  (req, res, next) => {
    const typedReq = req as unknown as AuthRequestGeneric<never, MyDayQuery>;
    return getMyPosts(typedReq, res).catch(next);
  }
);
/**
* @swagger
* /my-day/{id}/comments:
*   post:
*     summary: 게시물에 댓글 작성
*     tags: [MyDay]
*     security:
*       - bearerAuth: []
*/
router.post('/:id/comments',
  authMiddleware,
  validateRequest([
    body('content').isLength({ min: 1, max: 300 })
      .withMessage('댓글은 1자 이상 300자 이하여야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  (req, res) => createComment(req as any, res)
);

/**
* @swagger
* /my-day/{id}/like:
*   post:
*     summary: 게시물 좋아요/좋아요 취소
*     tags: [MyDay]
*     security:
*       - bearerAuth: [] 
*/
router.post('/:id/like',
  authMiddleware,
  (req, res) => likePost(req as any, res)
);

/**
* @swagger
* /my-day/posts/{id}:
*   delete:
*     summary: 게시물 삭제
*     tags: [MyDay]
*     security:
*       - bearerAuth: []
*/
router.delete('/posts/:id',  // 경로 수정
  authMiddleware,
  validateRequest([
    param('id').isInt({ min: 1 }).withMessage('유효한 게시물 ID가 아닙니다.')
  ]),
  (req, res) => deletePost(req as any, res)
);
export default router;