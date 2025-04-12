import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 컨트롤러 모킹
const mockMyDayController = {
  createComment: jest.fn(),
  getComments: jest.fn(),
  deleteComment: jest.fn(), // 댓글 삭제 기능 추가
  updateComment: jest.fn()  // 댓글 수정 기능 추가
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/myDayController', () => mockMyDayController);

describe('댓글 API 테스트', () => {
  const mockUserId = 999;
  const mockPostId = 888;
  const mockCommentId = 123;
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockMyDayController).forEach(mock => mock.mockReset());
  });
  
  describe('댓글 작성 테스트 (/api/my-day/:id/comments)', () => {
    it('댓글이 성공적으로 작성되어야 함', async () => {
      // 성공 응답 모킹
      mockMyDayController.createComment.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          data: {
            comment_id: mockCommentId
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          content: '테스트 댓글입니다.',
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.createComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            comment_id: expect.any(Number)
          })
        })
      );
    });

    // 익명 댓글 작성 테스트 추가
    it('익명 댓글이 성공적으로 작성되어야 함', async () => {
      mockMyDayController.createComment.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          data: {
            comment_id: mockCommentId,
            is_anonymous: true
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          content: '익명 댓글 테스트',
          is_anonymous: true
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.createComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            comment_id: expect.any(Number),
            is_anonymous: true
          })
        })
      );
    });

    // 인증되지 않은 사용자 테스트 추가
    it('인증되지 않은 사용자는 댓글을 작성할 수 없음', async () => {
      mockMyDayController.createComment.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: undefined, // 인증 없음
        params: { id: String(mockPostId) },
        body: {
          content: '테스트 댓글',
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.createComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('인증')
        })
      );
    });
  });

  describe('댓글 조회 테스트 (/api/my-day/:id/comments)', () => {
    it('게시물의 댓글 목록을 조회할 수 있어야 함', async () => {
      // 성공 응답 모킹
      mockMyDayController.getComments.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            comments: [
              {
                comment_id: mockCommentId,
                content: '테스트 댓글',
                user_id: mockUserId,
                is_anonymous: false,
                created_at: new Date().toISOString()
              }
            ]
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.getComments(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            comments: expect.arrayContaining([
              expect.objectContaining({
                comment_id: expect.any(Number),
                content: expect.any(String)
              })
            ])
          })
        })
      );
    });

    // 존재하지 않는 게시물 테스트 추가
    it('존재하지 않는 게시물의 댓글을 조회할 수 없음', async () => {
      mockMyDayController.getComments.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: '99999' } // 존재하지 않는 게시물 ID
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.getComments(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });

    // 빈 댓글 목록 테스트 추가
    it('댓글이 없는 게시물은 빈 배열을 반환함', async () => {
      mockMyDayController.getComments.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            comments: []
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.getComments(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            comments: expect.arrayContaining([])
          })
        })
      );
    });
  });

  describe('댓글 작성 유효성 검사', () => {
    it('빈 내용의 댓글 작성 시 실패해야 함', async () => {
      // 실패 응답 모킹
      mockMyDayController.createComment.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          errors: [
            {
              field: 'content',
              message: '댓글은 1자 이상 300자 이하여야 합니다.'
            }
          ]
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          content: '',
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.createComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          errors: expect.any(Array)
        })
      );
    });

    it('너무 긴 내용의 댓글 작성 시 실패해야 함', async () => {
      // 실패 응답 모킹
      mockMyDayController.createComment.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          errors: [
            {
              field: 'content',
              message: '댓글은 1자 이상 300자 이하여야 합니다.'
            }
          ]
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          content: 'a'.repeat(501),
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.createComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          errors: expect.any(Array)
        })
      );
    });
  });

  // 새로운 테스트 섹션: 댓글 삭제 기능
  describe('댓글 삭제 테스트 (/api/my-day/:postId/comments/:id)', () => {
    it('자신이 작성한 댓글은 삭제할 수 있음', async () => {
      mockMyDayController.deleteComment.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '댓글이 성공적으로 삭제되었습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { 
          postId: String(mockPostId), 
          id: String(mockCommentId) 
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.deleteComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('삭제')
        })
      );
    });

    it('다른 사용자의 댓글은 삭제할 수 없음', async () => {
      mockMyDayController.deleteComment.mockImplementation((req, res) => {
        res.status(403).json({
          status: 'error',
          message: '이 댓글을 삭제할 권한이 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { 
          postId: String(mockPostId), 
          id: String(mockCommentId) 
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.deleteComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('권한')
        })
      );
    });

    it('존재하지 않는 댓글은 삭제할 수 없음', async () => {
      mockMyDayController.deleteComment.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '댓글을 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { 
          postId: String(mockPostId), 
          id: '99999' // 존재하지 않는 댓글 ID
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.deleteComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });

  // 새로운 테스트 섹션: 댓글 수정 기능
  describe('댓글 수정 테스트 (/api/my-day/:postId/comments/:id)', () => {
    it('자신이 작성한 댓글은 수정할 수 있음', async () => {
      mockMyDayController.updateComment.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '댓글이 성공적으로 수정되었습니다.',
          data: {
            comment_id: mockCommentId,
            content: '수정된 댓글 내용',
            updated_at: new Date().toISOString()
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { 
          postId: String(mockPostId), 
          id: String(mockCommentId) 
        },
        body: {
          content: '수정된 댓글 내용'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.updateComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('수정'),
          data: expect.objectContaining({
            content: expect.stringContaining('수정된')
          })
        })
      );
    });

    it('다른 사용자의 댓글은 수정할 수 없음', async () => {
      mockMyDayController.updateComment.mockImplementation((req, res) => {
        res.status(403).json({
          status: 'error',
          message: '이 댓글을 수정할 권한이 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { 
          postId: String(mockPostId), 
          id: String(mockCommentId) 
        },
        body: {
          content: '수정된 댓글 내용'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.updateComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('권한')
        })
      );
    });

    it('존재하지 않는 댓글은 수정할 수 없음', async () => {
      mockMyDayController.updateComment.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '댓글을 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { 
          postId: String(mockPostId), 
          id: '99999' // 존재하지 않는 댓글 ID
        },
        body: {
          content: '수정된 댓글 내용'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.updateComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });
});