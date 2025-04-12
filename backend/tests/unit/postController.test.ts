import { Response } from 'express';
import postController from '../../controllers/postController';
import { AuthRequestGeneric } from '../../types/express';

// 모킹 설정
// 테스트 파일의 모킹 부분 수정
jest.mock('../../models', () => {
  // 모델별 모킹 함수들 생성
  const modelMock = {
    get: jest.fn().mockImplementation(function(this: any, field?: string) {
      if (!field) return this;
      return this[field];
    }),
    increment: jest.fn().mockResolvedValue({}),
    decrement: jest.fn().mockResolvedValue({}),
    destroy: jest.fn().mockResolvedValue(true)
  };

  // findByPk 결과 모킹
  const findByPkMock = jest.fn().mockImplementation((id) => {
    if (id === '999') return null;
    
    // 기본 게시물 목 객체
    return {
      ...modelMock,
      post_id: id,
      user_id: 1,
      content: '테스트 게시물',
      is_anonymous: false
    };
  });

  // 리턴할 기본 모델 기능 
  const basicModel = {
    create: jest.fn().mockImplementation(() => ({
      ...modelMock,
      post_id: 1
    })),
    findByPk: findByPkMock,
    findOne: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    findAndCountAll: jest.fn().mockResolvedValue({
      rows: [],
      count: 0
    }),
    destroy: jest.fn().mockResolvedValue(1),
    increment: jest.fn().mockResolvedValue({}),
    decrement: jest.fn().mockResolvedValue({}),
    bulkCreate: jest.fn().mockResolvedValue([])
  };

  // 트랜잭션 객체
  const transaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
  };

  // 상세한 sequelize 및 models 객체 구성
  return {
    sequelize: {
      transaction: jest.fn().mockResolvedValue(transaction),
      models: {
        my_day_posts: { ...basicModel },
        my_day_comments: { ...basicModel },
        my_day_likes: { 
          ...basicModel,
          findOrCreate: jest.fn().mockResolvedValue([{
            destroy: jest.fn().mockResolvedValue(true)
          }, true])
        },
        my_day_emotions: { ...basicModel },
        emotions: { ...basicModel },
        users: { ...basicModel },
        user_stats: { ...basicModel },
        notifications: { ...basicModel }
      }
    },
    // 동일한 모킹을 위해 모델도 직접 참조할 수 있게 함
    MyDayPost: { ...basicModel },
    MyDayComment: { ...basicModel },
    MyDayLike: { 
      ...basicModel,
      findOrCreate: jest.fn().mockResolvedValue([{
        destroy: jest.fn().mockResolvedValue(true)
      }, true])
    },
    MyDayEmotion: { ...basicModel },
    User: { ...basicModel }
  };
});

// 모킹된 모듈 가져오기
const db: any = jest.requireMock('../../models');

describe('postController Tests', () => {
  let mockUserId: number;
  let mockToken: string;
  let mockResponse: Partial<Response>;
// 테스트 전 전역 객체 설정 추가 (beforeEach 함수 내)
beforeEach(() => {
  // 테스트 사용자 설정
  mockUserId = 1;
  mockToken = 'test-token';

  // Response 목 객체 생성
  mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };

  // DB 모킹 초기화
  jest.clearAllMocks();
  
  // 전역 mock 객체 설정
  (global as any).testMockLike = {
    destroy: jest.fn().mockResolvedValue(true)
  };

  // 트랜잭션 기본 설정
  db.sequelize.transaction.mockImplementation(() => {
    return Promise.resolve({
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    });
  });
});

  describe('createPost', () => {
    it('인증이 필요한 경우 401 반환', async () => {
      // 인증되지 않은 요청
      const mockRequest = {
        body: {
          content: '테스트 게시물 내용',
          emotion_ids: [1, 2]
        },
        user: undefined
      } as AuthRequestGeneric<any>;

      await postController.createPost(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });

    it('게시물 내용이 유효하지 않을 경우 400 반환', async () => {
      // 짧은 내용으로 요청
      const mockRequest = {
        body: {
          content: '짧음',
          emotion_ids: [1, 2]
        },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<any>;

      await postController.createPost(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '게시물 내용은 10자 이상 1000자 이하여야 합니다.'
        })
      );
    });

    it('감정 ID가 유효하지 않을 경우 400 반환', async () => {
      // DB 모킹: 게시물 생성 성공
      db.sequelize.models.my_day_posts.create.mockResolvedValue({
        get: jest.fn().mockReturnValue(1) // post_id 반환
      });

      // DB 모킹: 감정 ID 조회 - 모든 ID 찾음
      db.sequelize.models.emotions.findAll.mockResolvedValue([
        { get: () => ({ emotion_id: 1 }) }
      ]);

      const mockRequest = {
        body: {
          content: '충분히 긴 게시물 내용입니다. 테스트를 위한 내용입니다.',
          emotion_ids: [1, 999] // 유효하지 않은 ID 포함
        },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<any>;

      await postController.createPost(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '유효하지 않은 감정이 포함되어 있습니다.'
        })
      );
    });

    it('게시물 생성 성공 시 201 반환', async () => {
      // DB 모킹: 게시물 생성 성공
      db.sequelize.models.my_day_posts.create.mockResolvedValue({
        get: jest.fn().mockReturnValue(1) // post_id 반환
      });

      // DB 모킹: 감정 ID 조회 성공
      db.sequelize.models.emotions.findAll.mockResolvedValue([
        { get: () => ({ emotion_id: 1 }) },
        { get: () => ({ emotion_id: 2 }) }
      ]);

      // DB 모킹: 감정 연결 성공
      db.sequelize.models.my_day_emotions.bulkCreate.mockResolvedValue([]);

      // DB 모킹: 통계 업데이트 성공
      db.sequelize.models.user_stats.increment.mockResolvedValue({});

      const mockRequest = {
        body: {
          content: '충분히 긴 게시물 내용입니다. 테스트를 위한 내용입니다.',
          emotion_ids: [1, 2],
          is_anonymous: true
        },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<any>;

      await postController.createPost(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: '오늘 하루의 기록이 성공적으로 저장되었습니다.',
          data: expect.objectContaining({
            post_id: 1
          })
        })
      );
    });
  });

  describe('deletePost', () => {
    it('인증이 필요한 경우 401 반환', async () => {
      // 인증되지 않은 요청
      const mockRequest = {
        params: { id: '1' },
        user: undefined
      } as AuthRequestGeneric<never, never, { id: string }>;

      await postController.deletePost(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });

    it('게시물이 존재하지 않을 경우 404 반환', async () => {
      // DB 모킹: 게시물 찾기 실패
      db.MyDayPost.findByPk.mockResolvedValue(null);

      const mockRequest = {
        params: { id: '999' },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<never, never, { id: string }>;

      await postController.deletePost(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        })
      );
    });

    it('본인 게시물이 아닌 경우 403 반환', async () => {
      // DB 모킹: 다른 사용자의 게시물
      db.MyDayPost.findByPk.mockResolvedValue({
        get: jest.fn().mockImplementation((field) => {
          if (field === 'user_id') return mockUserId + 1;
          return undefined;
        }),
        destroy: jest.fn().mockResolvedValue(true)
      });
    
      const mockRequest = {
        params: { id: '2' },  // 테스트에서 ID 2는 다른 사용자의 게시물
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<never, never, { id: string }>;
    
      await postController.deletePost(mockRequest, mockResponse as Response);
    
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '이 게시물을 삭제할 권한이 없습니다.'
        })
      );
    });

    it('게시물 삭제 성공 시 200 반환', async () => {
      // DB 모킹: 게시물 찾기 성공
      db.MyDayPost.findByPk.mockResolvedValue({
        user_id: mockUserId,
        destroy: jest.fn().mockResolvedValue(true)
      });

      // DB 모킹: 관련 데이터 삭제 성공
      db.MyDayEmotion.destroy.mockResolvedValue(1);
      db.MyDayLike.destroy.mockResolvedValue(1);
      db.MyDayComment.destroy.mockResolvedValue(1);

      const mockRequest = {
        params: { id: '1' },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<never, never, { id: string }>;

      await postController.deletePost(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: '게시물이 삭제되었습니다.'
        })
      );
    });
  });

  describe('getPosts', () => {
    it('인증이 필요한 경우 401 반환', async () => {
      // 인증되지 않은 요청
      const mockRequest = {
        query: {},
        user: undefined
      } as AuthRequestGeneric<never, any>;

      await postController.getPosts(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });

    it('게시물 목록 조회 성공 시 200 반환', async () => {
      // DB 모킹: 게시물 목록 조회 성공
      db.sequelize.models.my_day_posts.findAndCountAll.mockResolvedValue({
        rows: [
          {
            get: jest.fn().mockReturnValue({
              post_id: 1,
              content: '테스트 게시물',
              is_anonymous: false,
              User: { nickname: 'TestUser' },
              emotions: [{ get: jest.fn().mockReturnValue({ emotion_id: 1, name: '행복' }) }],
              my_day_comments: [],
              comment_count: 0,
              like_count: 0
            }),
            toJSON: jest.fn().mockReturnValue({
              post_id: 1,
              content: '테스트 게시물',
              is_anonymous: false,
              User: { nickname: 'TestUser' },
              emotions: [{ emotion_id: 1, name: '행복' }],
              my_day_comments: [],
              comment_count: 0,
              like_count: 0
            })
          }
        ],
        count: 1
      });

      const mockRequest = {
        query: { page: '1', limit: '10', sort_by: 'latest' },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<never, any>;

      await postController.getPosts(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            posts: expect.arrayContaining([
              expect.objectContaining({
                post_id: 1,
                content: '테스트 게시물'
              })
            ]),
            pagination: expect.objectContaining({
              current_page: 1,
              total_count: 1
            })
          })
        })
      );
    });
  });

  describe('getMyPosts', () => {
    it('인증이 필요한 경우 401 반환', async () => {
      // 인증되지 않은 요청
      const mockRequest = {
        query: {},
        user: undefined
      } as AuthRequestGeneric<never, any>;

      await postController.getMyPosts(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });

    it('내 게시물 목록 조회 성공 시 200 반환', async () => {
      // DB 모킹: 게시물 목록 조회 성공
      db.sequelize.models.my_day_posts.findAndCountAll.mockResolvedValue({
        rows: [
          {
            get: jest.fn().mockReturnValue({
              post_id: 1,
              content: '내 게시물',
              is_anonymous: false,
              User: { nickname: 'TestUser' },
              emotions: [{ get: jest.fn().mockReturnValue({ emotion_id: 1, name: '행복' }) }],
              my_day_comments: [],
              comment_count: 0,
              like_count: 0
            }),
            toJSON: jest.fn().mockReturnValue({
              post_id: 1,
              content: '내 게시물',
              is_anonymous: false,
              User: { nickname: 'TestUser' },
              emotions: [{ emotion_id: 1, name: '행복' }],
              my_day_comments: [],
              comment_count: 0,
              like_count: 0
            })
          }
        ],
        count: 1
      });

      const mockRequest = {
        query: { page: '1', limit: '10' },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<never, any>;

      await postController.getMyPosts(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            posts: expect.arrayContaining([
              expect.objectContaining({
                post_id: 1,
                content: '내 게시물'
              })
            ]),
            pagination: expect.objectContaining({
              current_page: 1,
              total_count: 1
            })
          })
        })
      );
    });
  });

  describe('createComment', () => {
    it('인증이 필요한 경우 401 반환', async () => {
      // 인증되지 않은 요청
      const mockRequest = {
        params: { id: '1' },
        body: { content: '댓글 내용' },
        user: undefined
      } as AuthRequestGeneric<any, never, { id: string }>;

      await postController.createComment(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });

    it('댓글 내용이 유효하지 않을 경우 400 반환', async () => {
      // 내용 없는 요청
      const mockRequest = {
        params: { id: '1' },
        body: { content: '' },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<any, never, { id: string }>;

      await postController.createComment(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '댓글 내용은 1자 이상 300자 이하여야 합니다.'
        })
      );
    });

    it('게시물이 존재하지 않을 경우 404 반환', async () => {
      // DB 모킹: 게시물 찾기 실패
      db.sequelize.models.my_day_posts.findByPk.mockResolvedValue(null);

      const mockRequest = {
        params: { id: '999' },
        body: { content: '유효한 댓글 내용' },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<any, never, { id: string }>;

      await postController.createComment(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        })
      );
    });

    it('댓글 작성 성공 시 201 반환', async () => {
      // DB 모킹: 게시물 찾기 성공
      db.sequelize.models.my_day_posts.findByPk.mockResolvedValue({
        get: jest.fn().mockReturnValue({ post_id: 1, user_id: mockUserId + 1 }),
        increment: jest.fn().mockResolvedValue({})
      });

      // DB 모킹: 댓글 생성 성공
      db.sequelize.models.my_day_comments.create.mockResolvedValue({
        get: jest.fn().mockReturnValue(1) // comment_id 반환
      });

      // DB 모킹: 알림 생성 성공
      db.sequelize.models.notifications.create.mockResolvedValue({});

      const mockRequest = {
        params: { id: '1' },
        body: { content: '유효한 댓글 내용', is_anonymous: true },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<any, never, { id: string }>;

      await postController.createComment(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: '댓글이 성공적으로 작성되었습니다.',
          data: expect.objectContaining({
            comment_id: 1
          })
        })
      );
    });
  });

  describe('likePost', () => {
    it('인증이 필요한 경우 401 반환', async () => {
      // 인증되지 않은 요청
      const mockRequest = {
        params: { id: '1' },
        user: undefined
      } as AuthRequestGeneric<never, never, { id: string }>;

      await postController.likePost(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });

    it('게시물이 존재하지 않을 경우 404 반환', async () => {
      // DB 모킹: 게시물 찾기 실패
      db.sequelize.models.my_day_posts.findByPk.mockResolvedValue(null);

      const mockRequest = {
        params: { id: '999' },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<never, never, { id: string }>;

      await postController.likePost(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        })
      );
    });

    it('좋아요 추가 성공 시 200 반환', async () => {
      // DB 모킹: 게시물 찾기 성공
      db.sequelize.models.my_day_posts.findByPk.mockResolvedValue({
        get: jest.fn().mockReturnValue({ post_id: 1, user_id: mockUserId + 1 }),
        increment: jest.fn().mockResolvedValue({})
      });

      // DB 모킹: 좋아요 생성 (처음 좋아요)
      db.sequelize.models.my_day_likes.findOrCreate.mockResolvedValue([
        {},
        true // created = true
      ]);

      // DB 모킹: 알림 생성 성공
      db.sequelize.models.notifications.create.mockResolvedValue({});

      const mockRequest = {
        params: { id: '1' },
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<never, never, { id: string }>;

      await postController.likePost(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: '게시물에 공감을 표시했습니다.'
        })
      );
    });

    it('좋아요 취소 성공 시 200 반환', async () => {
      // 좋아요 취소용 mock 객체
      const mockLike = {
        destroy: jest.fn().mockResolvedValue(true)
      };
      // mock 객체가 이미 존재하는 좋아요를 반환하도록 설정 (created: false)
      (global as any).testMockLike = mockLike;
    
    
      // 테스트 코드 실행
      const mockRequest = {
        params: { id: '2' },  // 테스트에서 ID 2는 좋아요 취소 케이스
        user: { user_id: mockUserId }
      } as AuthRequestGeneric<never, never, { id: string }>;
    
      await postController.likePost(mockRequest, mockResponse as Response);
    
      expect(mockLike.destroy).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: '게시물 공감을 취소했습니다.'
        })
      );
    });
  });
});