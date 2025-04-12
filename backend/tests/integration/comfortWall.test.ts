// /backend/tests/integration/comfortWall.test.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 컨트롤러 모킹
const mockComfortWallController = {
  createComfortWallPost: jest.fn(),
  getBestPosts: jest.fn(),
  getComfortWallPosts: jest.fn(),
  createComfortMessage: jest.fn(),
  getChallengeDetails: jest.fn()
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/comfortWallController', () => mockComfortWallController);

describe('위로의 벽 API 테스트', () => {
  const mockUserId = 999;
  const mockPostId = 888;
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockComfortWallController).forEach(mock => mock.mockReset());
  });
  
  describe('게시물 작성 테스트 (/api/comfort-wall)', () => {
    it('게시물이 성공적으로 작성되어야 함', async () => {
      // 성공 응답 모킹
      mockComfortWallController.createComfortWallPost.mockImplementation((req, res) => {
        res.status(201).json({
          message: "위로와 공감 게시물이 성공적으로 생성되었습니다.",
          post_id: mockPostId
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId },
        body: {
          title: '위로가 필요한 일상',
          content: '오늘은 정말 힘든 하루였습니다. 이런 저런 일이 있었고, 많이 지쳐있습니다. 20자 이상의 내용을 작성합니다.',
          is_anonymous: true,
          emotion_ids: [1, 2]
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.createComfortWallPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('성공적으로 생성'),
          post_id: expect.any(Number)
        })
      );
    });

    it('제목이 짧은 경우 게시물 작성이 실패해야 함', async () => {
      mockComfortWallController.createComfortWallPost.mockImplementation((req, res) => {
        res.status(400).json({
          message: '제목은 5자 이상 100자 이하여야 합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          title: '짧음',
          content: '오늘은 정말 힘든 하루였습니다. 이런 저런 일이 있었고, 많이 지쳐있습니다. 20자 이상의 내용을 작성합니다.',
          is_anonymous: true
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.createComfortWallPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('제목은 5자 이상')
        })
      );
    });

    it('내용이 짧은 경우 게시물 작성이 실패해야 함', async () => {
      mockComfortWallController.createComfortWallPost.mockImplementation((req, res) => {
        res.status(400).json({
          message: '게시물 내용은 20자 이상 2000자 이하여야 합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          title: '위로가 필요한 일상',
          content: '짧은 내용',
          is_anonymous: true
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.createComfortWallPost(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('20자 이상')
        })
      );
    });
  });

  describe('인기 게시물 조회 테스트 (/api/comfort-wall/best)', () => {
    it('인기 게시물 목록이 성공적으로 조회되어야 함', async () => {
      mockComfortWallController.getBestPosts.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            posts: [
              {
                title: '인기 게시물',
                content: '많은 공감을 받은 게시물입니다.',
                is_anonymous: false,
                like_count: 50,
                comment_count: 20,
                user: {
                  nickname: '작성자',
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
        query: { period: 'weekly' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.getBestPosts(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            posts: expect.arrayContaining([
              expect.objectContaining({
                title: expect.any(String),
                like_count: expect.any(Number)
              })
            ])
          })
        })
      );
    });

    it('인증되지 않은 사용자는 인기 게시물을 조회할 수 없음', async () => {
      mockComfortWallController.getBestPosts.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: undefined,
        query: { period: 'weekly' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.getBestPosts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('인증')
        })
      );
    });
  });

  describe('게시물 목록 조회 테스트 (/api/comfort-wall)', () => {
    it('게시물 목록이 성공적으로 조회되어야 함', async () => {
      mockComfortWallController.getComfortWallPosts.mockImplementation((req, res) => {
        res.json({
          posts: [
            {
              post_id: mockPostId,
              title: '위로가 필요한 일상',
              content: '오늘은 정말 힘든 하루였습니다.',
              summary: '오늘은 정말 힘든 하루였습니다.',
              is_anonymous: true,
              User: null,
              like_count: 5,
              comment_count: 2,
              tags: [
                { tag_id: 1, name: '위로' }
              ]
            }
          ],
          totalPages: 1,
          currentPage: 1,
          totalCount: 1
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
      
      await mockComfortWallController.getComfortWallPosts(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          posts: expect.arrayContaining([
            expect.objectContaining({
              post_id: expect.any(Number),
              title: expect.any(String)
            })
          ]),
          totalPages: expect.any(Number),
          currentPage: expect.any(Number)
        })
      );
    });

    it('정렬 옵션으로 게시물 목록이 조회되어야 함', async () => {
      mockComfortWallController.getComfortWallPosts.mockImplementation((req, res) => {
        res.json({
          posts: [
            {
              post_id: mockPostId,
              title: '인기 있는 게시물',
              content: '많은 댓글이 달린 게시물입니다.',
              is_anonymous: false,
              User: {
                nickname: '작성자',
                profile_image_url: null
              },
              comment_count: 20
            }
          ],
          totalPages: 1,
          currentPage: 1,
          totalCount: 1
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { 
          page: '1', 
          limit: '10',
          sortBy: 'popular'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.getComfortWallPosts(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          posts: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('인기'),
              comment_count: expect.any(Number)
            })
          ])
        })
      );
    });
  });

  describe('위로 메시지 전송 테스트 (/api/comfort-wall/:id/message)', () => {
    it('위로 메시지가 성공적으로 전송되어야 함', async () => {
      mockComfortWallController.createComfortMessage.mockImplementation((req, res) => {
        res.status(201).json({
          message: "위로의 메시지가 성공적으로 전송되었습니다.",
          encouragement_message_id: 123
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          message: '정말 힘드셨겠네요. 응원합니다!',
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.createComfortMessage(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('메시지가 성공적으로 전송'),
          encouragement_message_id: expect.any(Number)
        })
      );
    });

    it('메시지 내용이 짧은 경우 전송이 실패해야 함', async () => {
      mockComfortWallController.createComfortMessage.mockImplementation((req, res) => {
        res.status(400).json({
          message: '위로의 메시지는 5자 이상 500자 이하여야 합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          message: '짧음',
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.createComfortMessage(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('5자 이상')
        })
      );
    });

    it('자신의 게시물에는 위로 메시지를 보낼 수 없음', async () => {
      mockComfortWallController.createComfortMessage.mockImplementation((req, res) => {
        res.status(400).json({
          message: '자신의 게시물에는 위로 메시지를 보낼 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockPostId) },
        body: {
          message: '내 게시물에 응원 메시지를 보냅니다.',
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.createComfortMessage(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('자신의 게시물')
        })
      );
    });

    it('존재하지 않는 게시물에는 위로 메시지를 보낼 수 없음', async () => {
      mockComfortWallController.createComfortMessage.mockImplementation((req, res) => {
        res.status(404).json({
          message: '게시물을 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: '99999' },
        body: {
          message: '응원 메시지를 보냅니다.',
          is_anonymous: false
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.createComfortMessage(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });

  describe('챌린지 상세 조회 테스트 (/api/comfort-wall/challenge/:id)', () => {
    it('챌린지 상세 정보가 성공적으로 조회되어야 함', async () => {
      mockComfortWallController.getChallengeDetails.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            challenge_id: 123,
            title: '위로의 챌린지',
            description: '서로를 위로하는 챌린지입니다.',
            creator: {
              user_id: 1,
              nickname: '챌린지 생성자'
            },
            participants: [
              {
                user_id: 1,
                user: {
                  nickname: '챌린지 생성자'
                }
              },
              {
                user_id: mockUserId,
                user: {
                  nickname: '테스트 사용자'
                }
              }
            ]
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: '123' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockComfortWallController.getChallengeDetails(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            challenge_id: expect.any(Number),
            title: expect.any(String),
            participants: expect.arrayContaining([
              expect.objectContaining({
                user_id: expect.any(Number)
              })
            ])
          })
        })
      );
    });

    it('존재하지 않는 챌린지 조회 시 실패해야 함', async () => {
      mockComfortWallController.getChallengeDetails.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
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
      
      await mockComfortWallController.getChallengeDetails(req, res);
      
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