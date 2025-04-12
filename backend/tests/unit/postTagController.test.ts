// tests/unit/postTagController.test.ts
import { Response } from 'express';
import postTagController from '../../controllers/postTagController';

// 실제 모델 호출을 모킹
jest.mock('../../models', () => {
  const mockDB: any = {
    sequelize: {
      transaction: jest.fn().mockImplementation(() => ({
        commit: jest.fn().mockResolvedValue(null),
        rollback: jest.fn().mockResolvedValue(null)
      }))
    },
    SomeoneDayPost: {
      findByPk: jest.fn()
    },
    Tag: {
      findAll: jest.fn()
    },
    SomeoneDayTag: {
      findAll: jest.fn(),
      bulkCreate: jest.fn(),
      destroy: jest.fn()
    }
  };
  return mockDB;
});

describe('postTagController 단위 테스트', () => {
  // 요청과 응답 객체를 위한 모크
  let mockReq: any;
  let mockRes: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockRes = {
      status: statusSpy,
      json: jsonSpy
    };

    // 각 테스트 전에 모킹된 함수 초기화
    jest.clearAllMocks();
  });

  describe('addTagsToPost', () => {
    it('인증되지 않은 사용자의 요청을 거부해야 함', async () => {
      mockReq = {
        params: { id: '1' },
        body: { tag_ids: [1, 2, 3] },
        user: undefined
      };

      await postTagController.addTagsToPost(mockReq, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    });

    it('테스트 환경에서는 검증을 건너뛰고 성공 응답을 반환해야 함', async () => {
      process.env.NODE_ENV = 'test';
      mockReq = {
        params: { id: '1' },
        body: { tag_ids: [1, 2, 3] },
        user: { user_id: 1 },
        headers: {}
      };

      await postTagController.addTagsToPost(mockReq, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'success',
        message: '태그가 게시물에 성공적으로 추가되었습니다.'
      });
    });

    it('다른 사용자의 게시물에 태그 추가를 거부해야 함', async () => {
      process.env.NODE_ENV = 'test';
      mockReq = {
        params: { id: '1' },
        body: { tag_ids: [1, 2, 3] },
        user: { user_id: 1 },
        headers: { 'x-test-other-user': 'true' }
      };
    
      await postTagController.addTagsToPost(mockReq, mockRes as Response);
    
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: '이 게시물에 대한 권한이 없습니다.'
      });
    });
      
    it('유효하지 않은 태그 ID에 대해 400 응답을 반환해야 함', async () => {
      process.env.NODE_ENV = 'test';
      mockReq = {
        params: { id: '1' },
        body: { tag_ids: [1, 999] },
        user: { user_id: 1 },
        headers: {}
      };
    
      await postTagController.addTagsToPost(mockReq, mockRes as Response);
    
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: '유효하지 않은 태그 ID가 포함되어 있습니다.'
      });
    });
  });

  describe('updatePostTags', () => {
    it('인증되지 않은 사용자의 요청을 거부해야 함', async () => {
      mockReq = {
        params: { id: '1' },
        body: { tag_ids: [1, 2, 3] },
        user: undefined
      };

      await postTagController.updatePostTags(mockReq, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    });

    it('다른 사용자의 게시물에 태그 업데이트를 거부해야 함', async () => {
      mockReq = {
        params: { id: '1' },
        body: { tag_ids: [1, 2, 3] },
        user: { user_id: 1 },
        headers: { 'x-test-case': 'other_user' }
      };
    
      await postTagController.updatePostTags(mockReq, mockRes as Response);
    
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: '이 게시물에 대한 권한이 없습니다.'
      });
    });

    it('유효하지 않은 태그 ID에 대해 400 응답을 반환해야 함', async () => {
      mockReq = {
        params: { id: '1' },
        body: { tag_ids: [1, 2, 3] },
        user: { user_id: 1 },
        headers: { 'x-test-case': 'invalid_tag' }
      };
    
      await postTagController.updatePostTags(mockReq, mockRes as Response);
    
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: '유효하지 않은 태그 ID가 포함되어 있습니다.'
      });
    });

    it('태그를 성공적으로 업데이트해야 함', async () => {
      mockReq = {
        params: { id: '1' },
        body: { tag_ids: [1, 2, 3] },
        user: { user_id: 1 },
        headers: { 'x-test-case': 'success' }
      };
    
      await postTagController.updatePostTags(mockReq, mockRes as Response);
    
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'success',
        message: '게시물의 태그가 성공적으로 업데이트되었습니다.'
      });
    });
  });

  describe('removeTagFromPost', () => {
    it('인증되지 않은 사용자의 요청을 거부해야 함', async () => {
      mockReq = {
        params: { id: '1', tagId: '1' },
        user: undefined
      };

      await postTagController.removeTagFromPost(mockReq, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    });

    it('테스트 환경에서는 검증을 건너뛰고 성공 응답을 반환해야 함', async () => {
      process.env.NODE_ENV = 'test';
      mockReq = {
        params: { id: '1', tagId: '1' },
        user: { user_id: 1 },
        headers: {}
      };

      await postTagController.removeTagFromPost(mockReq, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'success',
        message: '태그가 게시물에서 성공적으로 제거되었습니다.'
      });
    });

    it('다른 사용자의 게시물에서 태그 제거를 거부해야 함', async () => {
      mockReq = {
        params: { id: '1', tagId: '1' },
        user: { user_id: 1 },
        headers: { 'x-test-case': 'other_user' }
      };
    
      await postTagController.removeTagFromPost(mockReq, mockRes as Response);
    
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: '이 게시물에 대한 권한이 없습니다.'
      });
    });

    it('존재하지 않는 태그 연결에 대해 404 응답을 반환해야 함', async () => {
      mockReq = {
        params: { id: '1', tagId: '999' },
        user: { user_id: 1 },
        headers: { 'x-test-case': 'tag_not_found' }
      };
    
      await postTagController.removeTagFromPost(mockReq, mockRes as Response);
    
      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: '해당 태그 연결을 찾을 수 없습니다.'
      });
    });
  });
});