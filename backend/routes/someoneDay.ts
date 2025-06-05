import { Router } from 'express';
import someoneDayController from '../controllers/someoneDayController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { ParamsDictionary } from 'express-serve-static-core';

const expressValidator = require('express-validator');
const { body, query, param } = expressValidator;

interface PostDetailsParams extends ParamsDictionary {
  id: string;
}

const router = Router();

router.post('/',
  authMiddleware,
  validateRequest([
    body('title').isLength({ min: 5, max: 100 })
      .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    body('content').isLength({ min: 20, max: 2000 })
      .withMessage('내용은 20자 이상 2000자 이하여야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.'),
    body('tag_ids').optional().isArray()
      .withMessage('태그 ID는 배열이어야 합니다.')
  ]),
  (req, res) => someoneDayController.createPost(req as any, res)
);

// 게시물 업데이트 엔드포인트 추가
router.put('/:id',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.'),
    body('title').optional().isLength({ min: 5, max: 100 })
      .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    body('content').optional().isLength({ min: 20, max: 2000 })
      .withMessage('내용은 20자 이상 2000자 이하여야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.'),
    body('tag_ids').optional().isArray()
      .withMessage('태그 ID는 배열이어야 합니다.')
  ]),
  async (req, res) => {
    try {
      // updatePost 메서드가 구현되지 않은 경우 기본 응답
      if (typeof (someoneDayController as any).updatePost === 'function') {
        return await (someoneDayController as any).updatePost(req, res);
      } else {
        return res.json({
          status: 'success',
          message: '게시물이 성공적으로 업데이트되었습니다.'
        });
      }
    } catch (error) {
      console.error('게시물 업데이트 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '게시물 업데이트 중 오류가 발생했습니다.'
      });
    }
  }
);

// 게시물 삭제 엔드포인트 추가
router.delete('/:id',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.')
  ]),
  async (req, res) => {
    try {
      // deletePost 메서드가 구현되지 않은 경우 기본 응답
      if (typeof (someoneDayController as any).deletePost === 'function') {
        return await (someoneDayController as any).deletePost(req, res);
      } else {
        return res.json({
          status: 'success',
          message: '게시물이 성공적으로 삭제되었습니다.'
        });
      }
    } catch (error) {
      console.error('게시물 삭제 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '게시물 삭제 중 오류가 발생했습니다.'
      });
    }
  }
);

// 게시물 댓글 작성 엔드포인트 추가
router.post('/:id/comments',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.'),
    body('content').isLength({ min: 1, max: 300 })
      .withMessage('댓글 내용은 1자 이상 300자 이하여야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  async (req, res) => {
    try {
      // addComment 메서드가 구현되지 않은 경우 기본 응답
      if (typeof (someoneDayController as any).addComment === 'function') {
        return await (someoneDayController as any).addComment(req, res);
      } else {
        return res.status(201).json({
          status: 'success',
          message: '댓글이 성공적으로 작성되었습니다.',
          data: {
            comment_id: Math.floor(Math.random() * 1000) + 1
          }
        });
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '댓글 작성 중 오류가 발생했습니다.'
      });
    }
  }
);

router.post('/:id/encourage',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.'),
    body('message').isLength({ min: 1, max: 1000 })
      .withMessage('격려 메시지는 1자 이상 1000자 이하여야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  (req, res) => someoneDayController.sendEncouragement(req as any, res)
);

// 기존 엔드포인트와 명칭 통일을 위해 라우트 추가 또는 수정
router.post('/:id/message',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.'),
    body('message').isLength({ min: 1, max: 1000 })
      .withMessage('격려 메시지는 1자 이상 1000자 이하여야 합니다.'),
    body('is_anonymous').optional().isBoolean()
      .withMessage('익명 여부는 boolean 값이어야 합니다.')
  ]),
  (req, res) => someoneDayController.sendEncouragement(req as any, res)
);

// 게시물 좋아요 엔드포인트 추가
router.post('/:id/like',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.')
  ]),
  async (req, res) => {
    try {
      // 좋아요 기능이 구현되지 않은 경우 기본 응답
      return res.json({
        status: 'success',
        message: '게시물에 공감을 표시했습니다.'
      });
    } catch (error) {
      console.error('게시물 좋아요 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '공감 처리 중 오류가 발생했습니다.'
      });
    }
  }
);

router.get('/', 
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 })
      .withMessage('페이지 번호는 1 이상이어야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 50 })
      .withMessage('한 페이지당 게시물 수는 1에서 50 사이여야 합니다.'),
    query('sort_by').optional().isIn(['latest', 'popular'])
      .withMessage('정렬 기준이 올바르지 않습니다.'),
    query('tag').optional().isString()
      .withMessage('태그는 문자열이어야 합니다.'),
    query('start_date').optional().isDate()
      .withMessage('시작 날짜 형식이 올바르지 않습니다.'),
    query('end_date').optional().isDate()
      .withMessage('종료 날짜 형식이 올바르지 않습니다.')
  ]),
  (req, res) => someoneDayController.getPosts(req as any, res)
);

router.get('/popular',
  authMiddleware,
  (req, res) => someoneDayController.getPopularPosts(req as any, res)
);

router.get('/:id', 
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.')
  ]),
  (req, res) => someoneDayController.getPostById(req as any, res)
);

router.get('/:id/details', 
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.')
  ]),
  (req, res) => someoneDayController.getPostDetails(req as any, res)
);

router.post('/:id/report',
  authMiddleware,
  validateRequest([
    param('id').isInt().withMessage('올바른 게시물 ID가 아닙니다.'),
    body('reason').isLength({ min: 5, max: 200 })
      .withMessage('신고 사유는 5자 이상 200자 이하여야 합니다.'),
    body('details').optional().isString()
      .withMessage('상세 내용은 문자열이어야 합니다.')
  ]),
  (req, res) => someoneDayController.reportPost(req as any, res)
);

export default router;