/**
 * @jest-environment node
 */

import { Response } from 'express';
import { AuthRequestGeneric } from '../../types/express';
import { ReportType, ReportStatus } from '../../models/PostReport';

// 전역 모킹이 jest.setup.js에서 설정되었음
import someoneDayController from '../../controllers/someoneDayController';
import db from '../../models';

// 인터페이스 정의 추가
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

interface SomeoneDayPostCreate {
  title: string;
  content: string;
  image_url?: string;
  is_anonymous?: boolean;
  tag_ids?: number[];
}

// 타입에 맞는 모의 객체 생성을 위한 helper
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

const createMockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return res as Response;
};

// DB 모킹 헬퍼 함수
function setupBasicMocks() {
  // sequelize 트랜잭션 모킹
  db.sequelize.transaction = jest.fn().mockResolvedValue({
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
  });
  
  // SomeoneDayPost.create 모킹
  db.SomeoneDayPost.create = jest.fn().mockResolvedValue({
    get: jest.fn().mockImplementation((key) => {
      if (key === 'post_id') return 1;
      return undefined;
    })
  });
  
  // Tag.findAll 모킹
  db.Tag.findAll = jest.fn().mockResolvedValue([
    { get: () => ({ tag_id: 1, name: '태그1' }) },
    { get: () => ({ tag_id: 2, name: '태그2' }) }
  ]);
  
  // SomeoneDayTag.bulkCreate 모킹
  db.SomeoneDayTag.bulkCreate = jest.fn().mockResolvedValue([]);
  
  // SomeoneDayPost.findOne 모킹
  db.SomeoneDayPost.findOne = jest.fn().mockImplementation((options) => {
    if (options && options.where && options.where.post_id === 999) {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      get: jest.fn().mockImplementation((key) => {
        if (key === 'post_id') return 1;
        if (key === 'user_id') return 2;
        if (key === 'is_anonymous') return false;
        if (key === 'user') return { nickname: '사용자' };
        if (key === 'encouragement_messages') return [];
        return { post_id: 1, title: '테스트' };
      })
    });
  });
  
  // SomeoneDayPost.findByPk 모킹
  db.SomeoneDayPost.findByPk = jest.fn().mockImplementation((id) => {
    if (id === '999') return Promise.resolve(null);
    return Promise.resolve({
      get: jest.fn().mockImplementation((key) => {
        if (key === 'post_id') return 1;
        if (key === 'user_id') return 2;
        return null;
      }),
      increment: jest.fn().mockResolvedValue(undefined)
    });
  });
  
  // SomeoneDayPost.findAndCountAll 모킹
  db.SomeoneDayPost.findAndCountAll = jest.fn().mockResolvedValue({
    rows: [
      {
        get: jest.fn().mockImplementation((option) => {
          if (option && option.plain) return { post_id: 1, title: '테스트' };
          return { post_id: 1, title: '테스트', is_anonymous: false, user: { nickname: '사용자' } };
        })
      }
    ],
    count: 1
  });
  
  // EncouragementMessage.create 모킹
  db.EncouragementMessage.create = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      get: jest.fn().mockImplementation((key) => {
        if (key === 'message_id') return 1;
        return null;
      })
    });
  });
  
  // Notification.create 모킹
  db.Notification.create = jest.fn().mockResolvedValue({});
  
  // PostReport 모킹
  db.PostReport.findOne = jest.fn().mockResolvedValue(null);
  db.PostReport.create = jest.fn().mockResolvedValue({});
}

describe('SomeoneDayController', () => {
  let mockResponse: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = createMockResponse();
    setupBasicMocks();
  });

  describe('createPost', () => {
    it('인증되지 않은 요청을 거부해야 함', async () => {
      const mockReq = createMockRequest<SomeoneDayPostCreate, any, any>({ 
        title: '',
        content: ''
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

    it('유효한 게시물을 생성해야 함', async () => {
      const mockReq = createMockRequest<SomeoneDayPostCreate, any, any>({
        title: '테스트 게시물',
        content: '이것은 테스트 게시물입니다. 충분한 길이의 내용입니다.',
        is_anonymous: false,
        tag_ids: [1, 2]
      }, {}, {}, { user_id: 1 });

      await someoneDayController.createPost(mockReq, mockResponse);

      expect(db.SomeoneDayPost.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('유효하지 않은 태그를 거부해야 함', async () => {
      // 모의 데이터 재설정
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

      // 유효하지 않은 태그 설정
      db.Tag.findAll = jest.fn().mockResolvedValue([
        { get: () => ({ tag_id: 1, name: '태그1' }) } // 요청된 태그 중 하나만 존재
      ]);

      const mockReq = createMockRequest<SomeoneDayPostCreate, any, any>({
        title: '테스트 게시물',
        content: '이것은 테스트 게시물입니다. 충분한 길이의 내용입니다.',
        tag_ids: [1, 2, 3] // 2, 3은 존재하지 않는 태그 ID
      }, {}, {}, { user_id: 1 });

      await someoneDayController.createPost(mockReq, mockResponse);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getPosts', () => {
    it('인증되지 않은 요청을 거부해야 함', async () => {
      const mockReq = createMockRequest<never, SomeoneDayQuery, any>(
        {} as never, 
        {}, 
        {}, 
        null
      );
      
      await someoneDayController.getPosts(mockReq, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '인증이 필요합니다.'
        })
      );
    });

    it('게시물 목록을 반환해야 함', async () => {
      const mockReq = createMockRequest<never, SomeoneDayQuery, any>(
        {} as never, 
        { page: '1', limit: '10', sort_by: 'latest' }, 
        {}, 
        { user_id: 1 }
      );
      
      await someoneDayController.getPosts(mockReq, mockResponse);

      expect(db.SomeoneDayPost.findAndCountAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });
  });

  describe('getPostById', () => {
    it('존재하는 게시물을 조회해야 함', async () => {
      db.SomeoneDayPost.findByPk = jest.fn().mockResolvedValue({
        get: jest.fn().mockImplementation((key) => {
          if (key === 'is_anonymous') return false;
          if (key === 'user') return { nickname: '사용자' };
          return { post_id: 1, title: '테스트' };
        })
      });

      const mockReq = createMockRequest<never, never, { id: string }>(
        {} as never, 
        {} as never, 
        { id: '1' }, 
        { user_id: 1 }
      );
      
      await someoneDayController.getPostById(mockReq, mockResponse);

      expect(db.SomeoneDayPost.findByPk).toHaveBeenCalledWith('1', expect.anything());
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });

    it('존재하지 않는 게시물 조회 시 404를 반환해야 함', async () => {
      db.SomeoneDayPost.findByPk = jest.fn().mockResolvedValue(null);

      const mockReq = createMockRequest<never, never, { id: string }>(
        {} as never, 
        {} as never, 
        { id: '999' }, 
        { user_id: 1 }
      );
      
      await someoneDayController.getPostById(mockReq, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: '게시물을 찾을 수 없습니다.'
        })
      );
    });
  });

  describe('getPostDetails', () => {
    it('게시물 상세 정보를 반환해야 함', async () => {
      // 이 테스트에서는 SomeoneDayPost.findOne 메서드를 모킹
      const mockReq = createMockRequest<never, never, { id: string }>(
        {} as never, 
        {} as never, 
        { id: '1' }, 
        { user_id: 1 }
      );
      
      await someoneDayController.getPostDetails(mockReq, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });
  });

  describe('getPopularPosts', () => {
    it('인기 게시물 목록을 반환해야 함', async () => {
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
            tags: []
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

  describe('reportPost', () => {
    it('게시물 신고를 처리해야 함', async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

      const mockReq = createMockRequest<PostReport, never, PostParams>(
        { reason: '부적절한 내용', details: '상세 설명' },
        {} as never,
        { id: '2' },
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

    it('이미 신고한 게시물을 다시 신고할 수 없어야 함', async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
      
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

  describe('sendEncouragement', () => {
    it('격려 메시지를 전송해야 함', async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
    
      const mockReq = createMockRequest<{ message: string; is_anonymous?: boolean }, never, PostParams>(
        { message: '힘내세요!', is_anonymous: false },
        {} as never,
        { id: '1' },
        { user_id: 1 }
      );
    
      await someoneDayController.sendEncouragement(mockReq, mockResponse);
    
      expect(db.EncouragementMessage.create).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: '격려 메시지가 성공적으로 전송되었습니다.'
        })
      );
    });

    it('존재하지 않는 게시물에 메시지를 전송할 수 없어야 함', async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      db.sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

      db.SomeoneDayPost.findByPk = jest.fn().mockResolvedValue(null);

      const mockReq = createMockRequest<{ message: string; is_anonymous?: boolean }, never, PostParams>(
        { message: '힘내세요!', is_anonymous: false },
        {} as never,
        { id: '999' },
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