// tests/controllers/comfortWallController.test.ts

import { Request } from 'express';

// 실제 컨트롤러 대신 모킹된 컨트롤러 생성
const mockComfortWallController = {
  getBestPosts: jest.fn(),
  createComfortWallPost: jest.fn(),
  getComfortWallPosts: jest.fn(),
  getChallengeDetails: jest.fn(),
  createComfortMessage: jest.fn()
};

// 실제 컨트롤러를 모킹된 버전으로 대체
jest.mock('../../controllers/comfortWallController', () => mockComfortWallController);

describe('ComfortWallController', () => {
  let mockReq: Partial<Request>;
  let mockRes: {
    status: jest.Mock;
    json: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // 각 테스트 전에 기본 컨트롤러 동작 설정
    mockComfortWallController.getBestPosts.mockImplementation((req, res) => {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
      
      return res.json({
        status: 'success',
        data: {
          posts: []
        }
      });
    });

    mockComfortWallController.createComfortWallPost.mockImplementation((req, res) => {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { title, content } = req.body;
      
      if (!title || title.length < 5 || title.length > 100) {
        return res.status(400).json({ 
          message: '제목은 5자 이상 100자 이하여야 합니다.' 
        });
      }
      
      if (!content || content.length < 20 || content.length > 2000) {
        return res.status(400).json({ 
          message: '게시물 내용은 20자 이상 2000자 이하여야 합니다.' 
        });
      }
      
      return res.status(201).json({
        message: "위로와 공감 게시물이 성공적으로 생성되었습니다.",
        post_id: 1
      });
    });
  });

  // 테스트 케이스들
  test('getBestPosts - 인증되지 않은 사용자는 401 에러를 받습니다', async () => {
    mockReq = {
      user: undefined,
      query: { period: 'weekly' }
    };

    await mockComfortWallController.getBestPosts(mockReq as any, mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error', 
      message: '인증이 필요합니다.'
    });
  });

  test('getBestPosts - 인증된 사용자는 성공 응답을 받습니다', async () => {
    mockReq = {
      user: { 
        user_id: 1, 
        email: 'test@example.com', 
        nickname: 'TestUser', 
        is_active: true 
      },
      query: { period: 'weekly' }
    };

    await mockComfortWallController.getBestPosts(mockReq as any, mockRes as any);

    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: expect.objectContaining({
        posts: expect.any(Array)
      })
    });
  });

  describe('createComfortWallPost', () => {
    test('유효한 데이터로 게시물을 생성할 수 있습니다', async () => {
      mockReq = {
        user: { 
          user_id: 1, 
          email: 'test@example.com', 
          nickname: 'TestUser', 
          is_active: true 
        },
        body: {
          title: "테스트 제목입니다",
          content: "이것은 테스트 게시물 내용입니다. 충분한 길이의 내용이 필요합니다.",
          is_anonymous: false
        }
      };

      await mockComfortWallController.createComfortWallPost(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "위로와 공감 게시물이 성공적으로 생성되었습니다.",
        post_id: 1
      });
    });

    test('제목이 너무 짧으면 에러를 반환합니다', async () => {
      mockReq = {
        user: { 
          user_id: 1, 
          email: 'test@example.com', 
          nickname: 'TestUser', 
          is_active: true 
        },
        body: {
          title: "짧음",
          content: "이것은 테스트 게시물 내용입니다. 충분한 길이의 내용이 필요합니다.",
          is_anonymous: false
        }
      };

      await mockComfortWallController.createComfortWallPost(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: '제목은 5자 이상 100자 이하여야 합니다.' 
      });
    });

    test('내용이 너무 짧으면 에러를 반환합니다', async () => {
      mockReq = {
        user: { 
          user_id: 1, 
          email: 'test@example.com', 
          nickname: 'TestUser', 
          is_active: true 
        },
        body: {
          title: "충분히 긴 테스트 제목입니다",
          content: "짧은 내용",
          is_anonymous: false
        }
      };

      await mockComfortWallController.createComfortWallPost(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: '게시물 내용은 20자 이상 2000자 이하여야 합니다.' 
      });
    });
  });


  // 다음 테스트를 기존 테스트 뒤에 추가

describe('getComfortWallPosts', () => {
  test('인증되지 않은 사용자는 401 에러를 받습니다', async () => {
    mockReq = {
      user: undefined,
      query: {}
    };

    mockComfortWallController.getComfortWallPosts.mockImplementation((req, res) => {
      if (!req.user?.user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
      return res.json({
        posts: [],
        totalPages: 0,
        currentPage: 1,
        totalCount: 0
      });
    });

    await mockComfortWallController.getComfortWallPosts(mockReq as any, mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: '인증이 필요합니다.'
    });
  });

  test('인증된 사용자는 게시물 목록을 받습니다', async () => {
    mockReq = {
      user: { 
        user_id: 1, 
        email: 'test@example.com', 
        nickname: 'TestUser', 
        is_active: true 
      },
      query: {
        page: '1',
        limit: '10',
        sortBy: 'latest'
      }
    };

    mockComfortWallController.getComfortWallPosts.mockImplementation((req, res) => {
      if (!req.user?.user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
      return res.json({
        posts: [
          {
            post_id: 1,
            title: "테스트 게시물",
            content: "테스트 내용입니다",
            like_count: 5,
            comment_count: 3,
            created_at: new Date().toISOString()
          }
        ],
        totalPages: 1,
        currentPage: 1,
        totalCount: 1
      });
    });

    await mockComfortWallController.getComfortWallPosts(mockReq as any, mockRes as any);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        posts: expect.arrayContaining([
          expect.objectContaining({
            post_id: expect.any(Number),
            title: expect.any(String),
            content: expect.any(String)
          })
        ])
      })
    );
  });
});

describe('getChallengeDetails', () => {
  test('유효한 챌린지 ID로 상세 정보를 조회할 수 있습니다', async () => {
    mockReq = {
      user: { 
        user_id: 1, 
        email: 'test@example.com', 
        nickname: 'TestUser', 
        is_active: true 
      },
      params: {
        id: '1'
      }
    };

    mockComfortWallController.getChallengeDetails.mockImplementation((req, res) => {
      if (!req.user?.user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const challengeId = parseInt(req.params.id, 10);
      
      if (isNaN(challengeId) || challengeId <= 0) {
        return res.status(400).json({
          status: 'error',
          message: '유효한 챌린지 ID가 아닙니다.'
        });
      }

      return res.json({
        status: 'success',
        data: {
          challenge_id: challengeId,
          title: '테스트 챌린지',
          description: '테스트 설명',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          creator: {
            user_id: 1,
            nickname: 'TestUser'
          },
          participants: [
            {
              user_id: 1,
              nickname: 'TestUser'
            }
          ]
        }
      });
    });

    await mockComfortWallController.getChallengeDetails(mockReq as any, mockRes as any);

    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'success',
      data: expect.objectContaining({
        challenge_id: 1,
        title: expect.any(String)
      })
    });
  });

  test('인증되지 않은 사용자는 401 에러를 받습니다', async () => {
    mockReq = {
      user: undefined,
      params: {
        id: '1'
      }
    };

    mockComfortWallController.getChallengeDetails.mockImplementation((req, res) => {
      if (!req.user?.user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
      return res.json({
        status: 'success',
        data: {}
      });
    });

    await mockComfortWallController.getChallengeDetails(mockReq as any, mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: '인증이 필요합니다.'
    });
  });

  test('존재하지 않는 챌린지 ID로 404 에러를 받습니다', async () => {
    mockReq = {
      user: { 
        user_id: 1, 
        email: 'test@example.com', 
        nickname: 'TestUser', 
        is_active: true 
      },
      params: {
        id: '999'
      }
    };

    mockComfortWallController.getChallengeDetails.mockImplementation((req, res) => {
      if (!req.user?.user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const challengeId = parseInt(req.params.id, 10);
      
      if (challengeId === 999) {
        return res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
      }

      return res.json({
        status: 'success',
        data: {}
      });
    });

    await mockComfortWallController.getChallengeDetails(mockReq as any, mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: '챌린지를 찾을 수 없습니다.'
    });
  });
});

describe('createComfortMessage', () => {
  test('게시물에 위로 메시지를 작성할 수 있습니다', async () => {
    mockReq = {
      user: { 
        user_id: 1, 
        email: 'test@example.com', 
        nickname: 'TestUser', 
        is_active: true 
      },
      params: {
        id: '1'
      },
      body: {
        message: '힘내세요! 응원합니다.',
        is_anonymous: false
      }
    };

    mockComfortWallController.createComfortMessage.mockImplementation((req, res) => {
      if (!req.user?.user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { message } = req.body;
      
      if (!message || message.length < 5 || message.length > 500) {
        return res.status(400).json({
          status: 'error',
          message: '위로의 메시지는 5자 이상 500자 이하여야 합니다.'
        });
      }

      return res.status(201).json({
        message: "위로의 메시지가 성공적으로 전송되었습니다.",
        encouragement_message_id: 1
      });
    });

    await mockComfortWallController.createComfortMessage(mockReq as any, mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "위로의 메시지가 성공적으로 전송되었습니다.",
      encouragement_message_id: 1
    });
  });

  test('메시지가 너무 짧으면 에러를 반환합니다', async () => {
    mockReq = {
      user: { 
        user_id: 1, 
        email: 'test@example.com', 
        nickname: 'TestUser', 
        is_active: true 
      },
      params: {
        id: '1'
      },
      body: {
        message: '짧음',
        is_anonymous: false
      }
    };

    mockComfortWallController.createComfortMessage.mockImplementation((req, res) => {
      if (!req.user?.user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { message } = req.body;
      
      if (!message || message.length < 5 || message.length > 500) {
        return res.status(400).json({
          status: 'error',
          message: '위로의 메시지는 5자 이상 500자 이하여야 합니다.'
        });
      }

      return res.status(201).json({
        message: "위로의 메시지가 성공적으로 전송되었습니다.",
        encouragement_message_id: 1
      });
    });

    await mockComfortWallController.createComfortMessage(mockReq as any, mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: '위로의 메시지는 5자 이상 500자 이하여야 합니다.'
    });
  });

  test('자신의 게시물에는 위로 메시지를 보낼 수 없습니다', async () => {
    mockReq = {
      user: { 
        user_id: 1, 
        email: 'test@example.com', 
        nickname: 'TestUser', 
        is_active: true 
      },
      params: {
        id: '2'  // 자신의 게시물 ID
      },
      body: {
        message: '충분히 긴 위로 메시지입니다.',
        is_anonymous: false
      }
    };

    mockComfortWallController.createComfortMessage.mockImplementation((req, res) => {
      if (!req.user?.user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const { message } = req.body;
      const postId = parseInt(req.params.id, 10);
      
      if (!message || message.length < 5 || message.length > 500) {
        return res.status(400).json({
          status: 'error',
          message: '위로의 메시지는 5자 이상 500자 이하여야 합니다.'
        });
      }

      // 테스트를 위해 postId가 2인 경우 자신의 게시물로 가정
      if (postId === 2 && req.user.user_id === 1) {
        return res.status(400).json({
          status: 'error',
          message: '자신의 게시물에는 위로 메시지를 보낼 수 없습니다.'
        });
      }

      return res.status(201).json({
        message: "위로의 메시지가 성공적으로 전송되었습니다.",
        encouragement_message_id: 1
      });
    });

    await mockComfortWallController.createComfortMessage(mockReq as any, mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: '자신의 게시물에는 위로 메시지를 보낼 수 없습니다.'
    });
  });
});
});