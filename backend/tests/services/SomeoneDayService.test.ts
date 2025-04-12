import { Response } from 'express';
import { AuthRequestGeneric } from '../../types/express';
import db from '../../models';
import someoneDayController from '../../controllers/someoneDayController';

// 인터페이스 정의
interface SomeoneDayPostCreate {
  title: string;
  content: string;
  image_url?: string;
  is_anonymous?: boolean;
  tag_ids?: number[];
}

interface SomeoneDayQuery {
  page?: string;
  limit?: string;
  tag?: string;
  sort_by?: 'latest' | 'popular';
  start_date?: string;
  end_date?: string;
}

interface PostParams {
  id: string;
}

interface PostReport {
  reason: string;
  details?: string;
}


// 모의 응답 객체 생성 함수
const createMockResponse = () => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    return res as Response;
  };
  
  // 요청 객체 생성 함수
  function createMockRequest<T, Q, P>(
    body: T, 
    query: Q, 
    params: P, 
    user: any = { user_id: 1 }
  ): AuthRequestGeneric<T, Q, P> {
    return {
      body,
      query,
      params,
      user
    } as AuthRequestGeneric<T, Q, P>;
  }
// mockResponse를 describe 외부에 선언
let mockResponse: Response;
describe('SomeoneDayService', () => {
    // beforeEach 함수 앞에 mockResponse 초기화 제거
    beforeEach(() => {
        jest.clearAllMocks();
        mockResponse = createMockResponse();
      
        // models 모킹 방식 변경
        const originalModels = db.sequelize.models;
        Object.keys(originalModels).forEach(key => {
          // 특정 모델 메서드를 모킹
          jest.spyOn(originalModels[key], 'findByPk').mockImplementation(jest.fn());
          jest.spyOn(originalModels[key], 'findOne').mockImplementation(jest.fn());
          jest.spyOn(originalModels[key], 'findAll').mockImplementation(jest.fn());
          jest.spyOn(originalModels[key], 'create').mockImplementation(jest.fn());
          jest.spyOn(originalModels[key], 'increment').mockImplementation(jest.fn());
        });
      
        // someone_day_posts에 대한 특별한 모킹
        if (db.sequelize.models.someone_day_posts) {
          (db.sequelize.models.someone_day_posts as any) = {
            ...db.sequelize.models.someone_day_posts,
            findByPk: jest.fn(),
            increment: jest.fn()
          };
        }
      
        if (db.sequelize.models.encouragement_messages) {
          (db.sequelize.models.encouragement_messages as any) = {
            ...db.sequelize.models.encouragement_messages,
            create: jest.fn()
          };
        }
      
        if (db.sequelize.models.notifications) {
          (db.sequelize.models.notifications as any) = {
            ...db.sequelize.models.notifications,
            create: jest.fn()
          };
        }
        
        // 기존 모델 메서드 모킹
        jest.spyOn(db.SomeoneDayPost, 'findOne').mockImplementation(jest.fn());
        jest.spyOn(db.SomeoneDayPost, 'findByPk').mockImplementation(jest.fn());
        jest.spyOn(db.SomeoneDayPost, 'findAndCountAll').mockImplementation(jest.fn());
        jest.spyOn(db.SomeoneDayPost, 'findAll').mockImplementation(jest.fn());
        
        // 트랜잭션 모킹
        db.sequelize.transaction = jest.fn().mockResolvedValue({
          commit: jest.fn().mockResolvedValue(undefined),
          rollback: jest.fn().mockResolvedValue(undefined)
        });
      });

  describe('게시물 생성 서비스', () => {
    it('인증 없이 게시물 생성 시 401 에러', async () => {
      const mockReq = createMockRequest<SomeoneDayPostCreate, any, any>({ 
        title: '테스트 제목',
        content: '테스트 내용',
        tag_ids: []
      }, {}, {}, null);
      
      await someoneDayController.createPost(mockReq, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });

    it('유효한 게시물 생성', async () => {
      // 트랜잭션 모킹
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

      // SomeoneDayPost.create 모킹
      db.SomeoneDayPost.create = jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(1)
      });

      // Tag.findAll 모킹 - 모든 태그가 유효하게 설정
      db.Tag.findAll = jest.fn().mockResolvedValue([
        { get: () => ({ tag_id: 1, name: '태그1' }) },
        { get: () => ({ tag_id: 2, name: '태그2' }) }
      ]);

      // SomeoneDayTag.bulkCreate 모킹
      db.SomeoneDayTag.bulkCreate = jest.fn().mockResolvedValue([]);

      const mockReq = createMockRequest<SomeoneDayPostCreate, any, any>({
        title: '테스트 게시물',
        content: '이것은 테스트 게시물입니다. 충분한 길이의 내용입니다.',
        is_anonymous: false,
        tag_ids: [1, 2]
      }, {}, {}, { user_id: 1 });

      await someoneDayController.createPost(mockReq, mockResponse);

      expect(db.SomeoneDayPost.create).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('유효하지 않은 태그 거부', async () => {
      // 트랜잭션 모킹
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

      // Tag.findAll 모킹 - 일부만 유효한 태그로 설정
      db.Tag.findAll = jest.fn().mockResolvedValue([
        { get: () => ({ tag_id: 1, name: '태그1' }) }
      ]);

      const mockReq = createMockRequest<SomeoneDayPostCreate, any, any>({
        title: '테스트 게시물',
        content: '이것은 테스트 게시물입니다. 충분한 길이의 내용입니다.',
        tag_ids: [1, 2, 3]  // tag_id 3은 존재하지 않는 태그
      }, {}, {}, { user_id: 1 });

      await someoneDayController.createPost(mockReq, mockResponse);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '유효하지 않은 태그가 포함되어 있습니다.'
        })
      );
    });
  });

  describe('게시물 조회 서비스', () => {
    it('인증 없이 게시물 조회 시 401 에러', async () => {
      const mockReq = createMockRequest<never, SomeoneDayQuery, any>({} as never, {}, {}, null);
      
      await someoneDayController.getPosts(mockReq, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });

    it('게시물 목록 정상 조회', async () => {
      db.SomeoneDayPost.findAndCountAll = jest.fn().mockResolvedValue({
        rows: [
          {
            get: jest.fn().mockImplementation((option) => {
              if (option && option.plain) return { post_id: 1, title: '테스트' };
              return { 
                post_id: 1, 
                title: '테스트', 
                is_anonymous: false, 
                user: { nickname: '사용자' },
                tags: [{ tag_id: 1, name: '태그' }]
              };
            })
          }
        ],
        count: 1
      });

      const mockReq = createMockRequest<never, SomeoneDayQuery, any>(
        {} as never, 
        { page: '1', limit: '10', sort_by: 'latest' }, 
        {}, 
        { user_id: 1 }
      );
      
      await someoneDayController.getPosts(mockReq, mockResponse);

      expect(db.SomeoneDayPost.findAndCountAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });
  });

  describe('게시물 상세 조회 서비스', () => {
    it('특정 게시물 상세 정보 조회', async () => {
      db.SomeoneDayPost.findOne = jest.fn().mockResolvedValue({
        get: jest.fn().mockImplementation((key) => {
          if (key === 'is_anonymous') return false;
          if (key === 'user') return { nickname: '사용자' };
          if (key === 'encouragement_messages') return [];
          return { 
            post_id: 1, 
            title: '테스트 게시물', 
            content: '상세 내용' 
          };
        })
      });

      const mockReq = createMockRequest<never, never, { id: string }>(
        {} as never, 
        {} as never, 
        { id: '1' }, 
        { user_id: 1 }
      );
      
      await someoneDayController.getPostDetails(mockReq, mockResponse);

      expect(db.SomeoneDayPost.findOne).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });

    it('존재하지 않는 게시물 조회 시 404 에러', async () => {
        db.SomeoneDayPost.findOne = jest.fn().mockResolvedValue(null);

      const mockReq = createMockRequest<never, never, { id: string }>(
        {} as never, 
        {} as never, 
        { id: '9999' }, 
        { user_id: 1 }
      );
      
      await someoneDayController.getPostDetails(mockReq, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        })
      );
    });
  });

  describe('인기 게시물 조회 서비스', () => {
    it('인기 게시물 목록 정상 조회', async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

      db.SomeoneDayPost.findAll = jest.fn().mockResolvedValue([
        {
          get: jest.fn().mockReturnValue({
            post_id: 1,
            title: '인기 게시물',
            is_anonymous: false,
            user: { nickname: '사용자' },
            tags: [],
            like_count: 10,
            comment_count: 5
          })
        }
      ]);

      const mockReq = createMockRequest<never, { days?: string }, any>(
        {} as never, 
        { days: '7' }, 
        {}, 
        { user_id: 1 }
      );
      
      await someoneDayController.getPopularPosts(mockReq, mockResponse);

      expect(db.SomeoneDayPost.findAll).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });
  });

  describe('게시물 신고 서비스', () => {
    it('게시물 신고 정상 처리', async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

      // 게시물 존재 모킹
      db.SomeoneDayPost.findOne = jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue({ post_id: 1, user_id: 2 })
      });
      
      // 기존 신고 없음 모킹
      db.PostReport.findOne = jest.fn().mockResolvedValue(null);
      db.PostReport.create = jest.fn().mockResolvedValue({});

      const mockReq = createMockRequest<PostReport, never, PostParams>(
        { reason: '부적절한 내용', details: '상세 설명' },
        {} as never,
        { id: '1' },
        { user_id: 1 }
      );

      await someoneDayController.reportPost(mockReq, mockResponse);

      expect(db.PostReport.create).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });

    it('이미 신고한 게시물 재신고 방지', async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

      // 게시물 존재 모킹
      db.SomeoneDayPost.findOne = jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue({ post_id: 1, user_id: 2 })
      });
      
      // 기존 신고 존재 모킹
      db.PostReport.findOne = jest.fn().mockResolvedValue({ report_id: 1 });

      const mockReq = createMockRequest<PostReport, never, PostParams>(
        { reason: '부적절한 내용' },
        {} as never,
        { id: '1' },
        { user_id: 1 }
      );

      await someoneDayController.reportPost(mockReq, mockResponse);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '이미 신고한 게시물입니다.'
        })
      );
    });
  });

  describe('격려 메시지 서비스', () => {
    // 격려 메시지 정상 전송 테스트 부분 수정
// 격려 메시지 정상 전송 테스트 부분 수정
// tests/services/SomeoneDayService.test.ts - 격려 메시지 정상 전송 테스트 부분

it('격려 메시지 정상 전송', async () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
  };
  db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

  // 게시물 존재 모킹 - 명확한 타입과 구현
  const mockPost = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'user_id') return 2;
      if (key === 'post_id') return 1;
      return null;
    }),
    increment: jest.fn().mockResolvedValue({
      get: jest.fn().mockReturnValue(1) // increment 후 반환되는 객체도 모킹
    })
  };
  
  // 명시적으로 findByPk 모킹
  db.SomeoneDayPost.findByPk = jest.fn().mockResolvedValue(mockPost);

  // 격려 메시지 생성 모킹 - 완전한 객체 반환
  const mockMessage = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'message_id') return 1;
      if (key === 'created_at') return new Date();
      return null;
    }),
    toJSON: jest.fn().mockReturnValue({
      message_id: 1,
      sender_id: 1,
      receiver_id: 2,
      post_id: 1,
      message: '힘내세요!',
      is_anonymous: false,
      created_at: new Date()
    })
  };
  
  db.EncouragementMessage.create = jest.fn().mockResolvedValue(mockMessage);

  // 알림 생성 모킹
  db.Notification.create = jest.fn().mockResolvedValue({
    id: 1,
    user_id: 2,
    content: '회원님의 게시물에 새로운 격려 메시지가 도착했습니다.',
    notification_type: 'comment',
    related_id: 1,
    is_read: false
  });

  const mockReq = createMockRequest<{ message: string; is_anonymous?: boolean }, never, PostParams>(
    { message: '힘내세요!', is_anonymous: false },
    {} as never,
    { id: '1' },
    { user_id: 1 }
  );

  await someoneDayController.sendEncouragement(mockReq, mockResponse);

  expect(db.EncouragementMessage.create).toHaveBeenCalled();
  expect(mockPost.increment).toHaveBeenCalled();
  expect(mockTransaction.commit).toHaveBeenCalled();
  expect(mockResponse.status).toHaveBeenCalledWith(201);
  expect(mockResponse.json).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'success',
      message: '격려 메시지가 성공적으로 전송되었습니다.'
    })
  );
});

// 존재하지 않는 게시물에 격려 메시지 전송 불가 테스트 부분 수정
it('존재하지 않는 게시물에 격려 메시지 전송 불가', async () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
  };
  db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

  // 게시물 존재하지 않음 모킹
  db.SomeoneDayPost.findByPk = jest.fn().mockResolvedValue(null);

  const mockReq = createMockRequest<{ message: string; is_anonymous?: boolean }, never, PostParams>(
    { message: '힘내세요!', is_anonymous: false },
    {} as never,
    { id: '9999' },
    { user_id: 1 }
  );

  await someoneDayController.sendEncouragement(mockReq, mockResponse);

  expect(mockTransaction.rollback).toHaveBeenCalled();
  expect(mockResponse.status).toHaveBeenCalledWith(404);
  expect(mockResponse.json).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'error',
      message: '게시물을 찾을 수 없습니다.'
    })
  );
});
  });
});