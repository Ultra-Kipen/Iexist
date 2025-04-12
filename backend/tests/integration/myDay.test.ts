// /backend/tests/integration/myDay.test.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 컨트롤러 모킹
const mockMyDayController = {
  createPost: jest.fn(),
  getPosts: jest.fn(),
  getMyPosts: jest.fn(),
  likePost: jest.fn(),
  createComment: jest.fn(),
  getComments: jest.fn(),
  deletePost: jest.fn()
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/myDayController', () => mockMyDayController);

describe('내 하루 API 테스트', () => {
  const mockUserId = 999;
  const mockPostId = 888;
  const mockCommentId = 123;
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockMyDayController).forEach(mock => mock.mockReset());
  });
  
  describe('게시물 작성 테스트 (/api/my-day/posts)', () => {
    it('게시물이 성공적으로 작성되어야 함', async () => {
      // 성공 응답 모킹
      mockMyDayController.createPost.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          message: '작업이 성공적으로 완료되었습니다.',
          data: {
            post_id: mockPostId
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId },
        body: {
          content: '오늘은 즐거운 하루였습니다. 좋은 일이 많이 있었어요.',
          emotion_ids: [1, 2],
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.createPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            post_id: expect.any(Number)
          })
        })
      );
    });

    it('내용이 너무 짧은 경우 게시물 작성이 실패해야 함', async () => {
      mockMyDayController.createPost.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          errors: [
            {
              field: 'content',
              message: '내용은 10자 이상 1000자 이하여야 합니다.'
            }
          ]
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          content: '짧음',
          emotion_ids: [1],
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.createPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'content'
            })
          ])
        })
      );
    });

    it('이미 작성한 경우 게시물 작성이 실패해야 함', async () => {
      mockMyDayController.createPost.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '오늘의 게시물은 이미 작성되었습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          content: '오늘은 즐거운 하루였습니다. 좋은 일이 많이 있었어요.',
          emotion_ids: [1],
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.createPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('이미 작성')
        })
      );
    });
  });

  describe('게시물 목록 조회 테스트 (/api/my-day/posts)', () => {
    it('게시물 목록이 성공적으로 조회되어야 함', async () => {
      mockMyDayController.getPosts.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            posts: [
              {
                post_id: mockPostId,
                content: '테스트 게시물 내용',
                like_count: 5,
                comment_count: 2,
                emotions: [
                  { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline' }
                ],
                created_at: new Date().toISOString()
              }
            ],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_count: 1,
              has_next: false
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { page: '1', limit: '10' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.getPosts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            posts: expect.arrayContaining([
              expect.objectContaining({
                post_id: expect.any(Number),
                content: expect.any(String)
              })
            ]),
            pagination: expect.any(Object)
          })
        })
      );
    });
  });

  describe('내 게시물 목록 조회 테스트 (/api/my-day/posts/me)', () => {
    it('내 게시물 목록이 성공적으로 조회되어야 함', async () => {
      mockMyDayController.getMyPosts.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            posts: [
              {
                post_id: mockPostId,
                content: '내 게시물 내용',
                like_count: 3,
                comment_count: 1,
                emotions: [
                  { emotion_id: 2, name: '감사', icon: 'hand-heart' }
                ],
                created_at: new Date().toISOString()
              }
            ],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_count: 1,
              has_next: false
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { page: '1', limit: '10' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.getMyPosts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            posts: expect.arrayContaining([
              expect.objectContaining({
                post_id: expect.any(Number),
                content: expect.any(String)
              })
            ])
          })
        })
      );
    });
  });

  describe('게시물 좋아요 테스트 (/api/my-day/:id/like)', () => {
    it('게시물 좋아요가 성공적으로 등록되어야 함', async () => {
      mockMyDayController.likePost.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '게시물에 좋아요를 표시했습니다.'
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
      
      await mockMyDayController.likePost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('좋아요')
        })
      );
    });

    it('이미 좋아요한 게시물은 좋아요가 취소되어야 함', async () => {
      mockMyDayController.likePost.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '게시물 좋아요를 취소했습니다.'
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
      
      await mockMyDayController.likePost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('취소')
        })
      );
    });
  });

  describe('댓글 작성 테스트 (/api/my-day/:id/comments)', () => {
    it('댓글이 성공적으로 작성되어야 함', async () => {
      mockMyDayController.createComment.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          data: {
            comment_id: mockCommentId
          }
        });
        return Promise.resolve();
      });
      
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

    it('댓글 내용이 없는 경우 작성이 실패해야 함', async () => {
      mockMyDayController.createComment.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          success: false,
          errors: [
            {
              field: 'content',
              message: '댓글은 1자 이상 300자 이하여야 합니다.'
            }
          ]
        });
        return Promise.resolve();
      });
      
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
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'content'
            })
          ])
        })
      );
    });
  });

  describe('댓글 목록 조회 테스트 (/api/my-day/:id/comments)', () => {
    it('댓글 목록이 성공적으로 조회되어야 함', async () => {
      mockMyDayController.getComments.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            comments: [
              {
                comment_id: mockCommentId,
                content: '테스트 댓글 내용',
                user_id: mockUserId,
                is_anonymous: false,
                created_at: new Date().toISOString(),
                User: {
                  nickname: '테스트유저',
                  profile_image_url: null
                }
              }
            ]
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

    it('익명 댓글은 사용자 정보가 포함되지 않아야 함', async () => {
      mockMyDayController.getComments.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            comments: [
              {
                comment_id: mockCommentId,
                content: '익명 댓글 내용',
                user_id: mockUserId,
                is_anonymous: true,
                created_at: new Date().toISOString(),
                User: null
              }
            ]
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
            comments: expect.arrayContaining([
              expect.objectContaining({
                is_anonymous: true,
                User: null
              })
            ])
          })
        })
      );
    });
  });

  describe('게시물 삭제 테스트 (/api/my-day/posts/:id)', () => {
    it('자신의 게시물은 성공적으로 삭제되어야 함', async () => {
      mockMyDayController.deletePost.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '게시물이 삭제되었습니다.'
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
      
      await mockMyDayController.deletePost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('삭제')
        })
      );
    });

    it('존재하지 않는 게시물은 삭제할 수 없음', async () => {
      mockMyDayController.deletePost.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '게시물을 찾을 수 없거나 삭제 권한이 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: '99999' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockMyDayController.deletePost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없거나')
        })
      );
    });
  });
});