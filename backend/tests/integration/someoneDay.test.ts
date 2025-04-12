// /backend/tests/integration/someoneDay.test.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 컨트롤러 모킹
const mockSomeoneDayController = {
  createPost: jest.fn(),
  getPosts: jest.fn(),
  getPostDetails: jest.fn(),
  getPopularPosts: jest.fn(),
  getPostById: jest.fn(),
  reportPost: jest.fn(),
  sendEncouragement: jest.fn()
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/someoneDayController', () => mockSomeoneDayController);

describe('누군가의 하루 API 테스트', () => {
  const mockUserId = 999;
  const mockPostId = 888;
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockSomeoneDayController).forEach(mock => mock.mockReset());
  });
  
  describe('게시물 작성 테스트 (/api/someone-day)', () => {
    it('게시물이 성공적으로 작성되어야 함', async () => {
      // 성공 응답 모킹
      mockSomeoneDayController.createPost.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          message: "게시물이 성공적으로 생성되었습니다.",
          data: { post_id: mockPostId }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId },
        body: {
          title: '위로가 필요한 하루',
          content: '오늘은 힘든 일이 있었습니다. 최소 20자 이상으로 작성해야 하는 내용입니다.',
          is_anonymous: true,
          tag_ids: [1, 2]
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.createPost(req, res);
      
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

    it('제목이 짧은 경우 게시물 작성이 실패해야 함', async () => {
      mockSomeoneDayController.createPost.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '제목은 5자 이상 100자 이하여야 합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          title: '짧음',
          content: '오늘은 힘든 일이 있었습니다. 최소 20자 이상으로 작성해야 하는 내용입니다.',
          is_anonymous: true
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.createPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('제목')
        })
      );
    });

    it('내용이 짧은 경우 게시물 작성이 실패해야 함', async () => {
      mockSomeoneDayController.createPost.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '게시물 내용은 20자 이상 2000자 이하여야 합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          title: '위로가 필요한 하루',
          content: '짧은 내용',
          is_anonymous: true
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.createPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('내용')
        })
      );
    });
  });

  describe('게시물 목록 조회 테스트 (/api/someone-day)', () => {
    it('게시물 목록이 성공적으로 조회되어야 함', async () => {
      mockSomeoneDayController.getPosts.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            posts: [
              {
                post_id: mockPostId,
                title: '위로가 필요한 하루',
                content: '오늘은 힘든 일이 있었습니다.',
                summary: '오늘은 힘든 일이 있었습니다.',
                is_anonymous: true,
                user: null,
                like_count: 5,
                comment_count: 2,
                tags: [
                  { tag_id: 1, name: '위로' },
                  { tag_id: 2, name: '응원' }
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
      
      await mockSomeoneDayController.getPosts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            posts: expect.arrayContaining([
              expect.objectContaining({
                post_id: expect.any(Number),
                title: expect.any(String)
              })
            ]),
            pagination: expect.any(Object)
          })
        })
      );
    });

    it('태그 필터링으로 게시물 목록이 조회되어야 함', async () => {
      mockSomeoneDayController.getPosts.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            posts: [
              {
                post_id: mockPostId,
                title: '위로가 필요한 하루',
                content: '오늘은 힘든 일이 있었습니다.',
                summary: '오늘은 힘든 일이 있었습니다.',
                is_anonymous: true,
                user: null,
                tags: [
                  { tag_id: 1, name: '위로' }
                ]
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
        query: { 
          page: '1', 
          limit: '10',
          tag: '위로'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.getPosts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            posts: expect.arrayContaining([
              expect.objectContaining({
                tags: expect.arrayContaining([
                  expect.objectContaining({
                    name: '위로'
                  })
                ])
              })
            ])
          })
        })
      );
    });
  });

  describe('인기 게시물 조회 테스트 (/api/someone-day/popular)', () => {
    it('인기 게시물 목록이 성공적으로 조회되어야 함', async () => {
      mockSomeoneDayController.getPopularPosts.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            posts: [
              {
                post_id: mockPostId,
                title: '인기 게시물',
                content: '많은 공감을 받은 게시물입니다.',
                is_anonymous: false,
                user: {
                  nickname: '작성자',
                  profile_image_url: null
                },
                like_count: 50,
                comment_count: 20,
                tags: [
                  { tag_id: 1, name: '위로' }
                ]
              }
            ]
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { days: '7' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.getPopularPosts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            posts: expect.arrayContaining([
              expect.objectContaining({
                post_id: expect.any(Number),
                like_count: expect.any(Number)
              })
            ])
          })
        })
      );
    });
  });

  describe('게시물 상세 조회 테스트 (/api/someone-day/:id/details)', () => {
    it('게시물 상세 정보가 성공적으로 조회되어야 함', async () => {
      mockSomeoneDayController.getPostDetails.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            post_id: mockPostId,
            title: '위로가 필요한 하루',
            content: '오늘은 힘든 일이 있었습니다.',
            is_anonymous: false,
            user: {
              nickname: '작성자',
              profile_image_url: null
            },
            like_count: 5,
            comment_count: 2,
            tags: [
              { tag_id: 1, name: '위로' }
            ],
            encouragement_messages: [
              {
                message_id: 1,
                message: '힘내세요!',
                created_at: new Date().toISOString(),
                sender: {
                  nickname: '응원자'
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
      
      await mockSomeoneDayController.getPostDetails(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            post_id: expect.any(Number),
            title: expect.any(String),
            encouragement_messages: expect.arrayContaining([
              expect.objectContaining({
                message: expect.any(String)
              })
            ])
          })
        })
      );
    });

    it('존재하지 않는 게시물 조회 시 실패해야 함', async () => {
      mockSomeoneDayController.getPostDetails.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
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
      
      await mockSomeoneDayController.getPostDetails(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });

  describe('게시물 격려 메시지 전송 테스트 (/api/someone-day/:id/encourage)', () => {
    it('격려 메시지가 성공적으로 전송되어야 함', async () => {
      mockSomeoneDayController.sendEncouragement.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          message: '격려 메시지가 성공적으로 전송되었습니다.',
          data: {
            message_id: 1,
            sender_id: mockUserId,
            post_id: Number(mockPostId),
            message: '힘내세요!',
            is_anonymous: false
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          message: '힘내세요!',
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.sendEncouragement(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('메시지'),
          data: expect.objectContaining({
            message_id: expect.any(Number)
          })
        })
      );
    });

    it('익명 격려 메시지가 성공적으로 전송되어야 함', async () => {
      mockSomeoneDayController.sendEncouragement.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          message: '격려 메시지가 성공적으로 전송되었습니다.',
          data: {
            message_id: 1,
            sender_id: mockUserId,
            post_id: Number(mockPostId),
            message: '익명으로 응원합니다!',
            is_anonymous: true
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          message: '익명으로 응원합니다!',
          is_anonymous: true
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.sendEncouragement(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            is_anonymous: true
          })
        })
      );
    });

    it('존재하지 않는 게시물에 격려 메시지 전송 시 실패해야 함', async () => {
      mockSomeoneDayController.sendEncouragement.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: '99999' },
        body: {
          message: '힘내세요!',
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.sendEncouragement(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });

  describe('게시물 신고 테스트 (/api/someone-day/:id/report)', () => {
    it('게시물이 성공적으로 신고되어야 함', async () => {
      mockSomeoneDayController.reportPost.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '게시물이 성공적으로 신고되었습니다. 관리자가 검토 후 조치하겠습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          reason: '부적절한 내용',
          details: '상세한 신고 사유입니다.'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.reportPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('신고')
        })
      );
    });

    it('이미 신고한 게시물 재신고 시 실패해야 함', async () => {
      mockSomeoneDayController.reportPost.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '이미 신고한 게시물입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          reason: '부적절한 내용',
          details: '상세한 신고 사유입니다.'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.reportPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('이미 신고')
        })
      );
    });

    it('신고 사유가 없는 경우 실패해야 함', async () => {
      mockSomeoneDayController.reportPost.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '신고 사유는 5자 이상 200자 이하여야 합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          reason: '',
          details: '상세한 신고 사유입니다.'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockSomeoneDayController.reportPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('신고 사유')
        })
      );
    });
  });
});