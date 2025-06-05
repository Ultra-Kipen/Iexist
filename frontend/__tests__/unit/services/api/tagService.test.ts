// __tests__/unit/services/api/tagService.test.ts

// 먼저 client 모듈을 모킹하여 interceptors 문제 해결
jest.mock('../../../../src/services/api/client', () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn()
      },
      response: {
        use: jest.fn(),
        eject: jest.fn()
      }
    }
  };
});

import { tagService, Tag, TagWithCount } from '../../../../src/services/api/tagService';

describe('tagService 테스트', () => {
  beforeEach(() => {
    // 각 테스트 실행 전 모든 목 초기화
    jest.clearAllMocks();
    
    // 모킹된 메서드 생성 - client 자체는 이미 모킹되어 있으므로 필요 없음
    // jest 모킹은 모듈 임포트 전에 이루어져야 하므로 여기서 메서드를 재설정하면 됨
  });

  describe('updateTag', () => {
    it('태그를 성공적으로 업데이트해야 함', async () => {
      const tagId = 1;
      const newTagName = '업데이트된 태그';
      const updatedTag: Tag = {
        tag_id: tagId,
        name: newTagName,
        created_at: '2024-04-25T10:00:00Z',
        updated_at: '2024-04-25T10:00:00Z'
      };
      
      (tagService.client.put as jest.Mock).mockResolvedValue({ 
        data: { 
          status: 'success',
          data: updatedTag 
        } 
      });
      
      const result = await tagService.updateTag(tagId, newTagName);
      
      expect(tagService.client.put).toHaveBeenCalledWith(`/tags/${tagId}`, { name: newTagName });
      expect(result).toEqual(updatedTag);
    });

    it('태그 업데이트 실패 시 오류 처리', async () => {
      const tagId = 1;
      const newTagName = '업데이트된 태그';
      
      (tagService.client.put as jest.Mock).mockRejectedValue(new Error('태그 수정에 실패했습니다'));
      
      await expect(tagService.updateTag(tagId, newTagName)).rejects.toThrow('태그 수정에 실패했습니다');
    });
  });

  // 나머지 테스트 케이스는 원래 코드와 동일하게 유지
  describe('deleteTag', () => {
    it('태그를 성공적으로 삭제해야 함', async () => {
      const tagId = 1;
      const mockResponse = { 
        status: 'success',
        message: '태그가 성공적으로 삭제되었습니다' 
      };
      
      (tagService.client.delete as jest.Mock).mockResolvedValue({ 
        data: mockResponse 
      });
      
      const result = await tagService.deleteTag(tagId);
      
      expect(tagService.client.delete).toHaveBeenCalledWith(`/tags/${tagId}`);
      expect(result).toEqual(mockResponse);
    });

    it('태그 삭제 실패 시 오류 처리', async () => {
      const tagId = 1;
      
      (tagService.client.delete as jest.Mock).mockRejectedValue(new Error('태그 삭제에 실패했습니다'));
      
      await expect(tagService.deleteTag(tagId)).rejects.toThrow('태그 삭제에 실패했습니다');
    });
  });

  describe('getTagById', () => {
    it('특정 태그를 성공적으로 조회해야 함', async () => {
      const tagId = 1;
      const mockTag: Tag = {
        tag_id: tagId,
        name: '위로',
        created_at: '2024-04-25T10:00:00Z',
        updated_at: '2024-04-25T10:00:00Z'
      };
      
      (tagService.client.get as jest.Mock).mockResolvedValue({ 
        data: { 
          status: 'success',
          data: mockTag 
        } 
      });
      
      const result = await tagService.getTagById(tagId);
      
      expect(tagService.client.get).toHaveBeenCalledWith(`/tags/${tagId}`);
      expect(result).toEqual(mockTag);
    });

    it('존재하지 않는 태그 조회 시 오류 처리', async () => {
      const tagId = 999;
      
      (tagService.client.get as jest.Mock).mockRejectedValue(new Error('태그 정보 조회에 실패했습니다'));
      
      await expect(tagService.getTagById(tagId)).rejects.toThrow('태그 정보 조회에 실패했습니다');
    });
  });

  describe('getPostsByTag', () => {
    it('특정 태그의 게시물을 성공적으로 조회해야 함', async () => {
      const tagId = 1;
      const mockPosts = [
        { id: 1, title: '첫 번째 게시물' },
        { id: 2, title: '두 번째 게시물' }
      ];
      
      (tagService.client.get as jest.Mock).mockResolvedValue({ 
        data: { 
          status: 'success',
          data: mockPosts,
          pagination: {
            total: 2,
            page: 1,
            limit: 10
          }
        } 
      });
      
      const result = await tagService.getPostsByTag(tagId, {
        page: 1,
        limit: 10,
        post_type: 'my_day'
      });
      
      expect(tagService.client.get).toHaveBeenCalledWith(`/tags/${tagId}/posts`, { 
        params: {
          page: 1,
          limit: 10,
          post_type: 'my_day'
        } 
      });
      expect(result.data).toEqual(mockPosts);
      expect(result.pagination).toBeDefined();
    });

    it('태그별 게시물 조회 실패 시 오류 처리', async () => {
      const tagId = 1;
      
      (tagService.client.get as jest.Mock).mockRejectedValue(new Error('태그별 게시물 조회에 실패했습니다'));
      
      await expect(
        tagService.getPostsByTag(tagId, { post_type: 'my_day' })
      ).rejects.toThrow('태그별 게시물 조회에 실패했습니다');
    });
  });

  describe('getAllTags', () => {
    it('모든 태그를 성공적으로 조회해야 함', async () => {
      const mockTags: Tag[] = [
        { tag_id: 1, name: '행복', created_at: '2024-04-25T10:00:00Z', updated_at: '2024-04-25T10:00:00Z' },
        { tag_id: 2, name: '슬픔', created_at: '2024-04-25T10:00:00Z', updated_at: '2024-04-25T10:00:00Z' }
      ];
      
      (tagService.client.get as jest.Mock).mockResolvedValue({ 
        data: { 
          status: 'success',
          data: mockTags 
        } 
      });
      
      const result = await tagService.getAllTags();
      
      expect(tagService.client.get).toHaveBeenCalledWith('/tags');
      expect(result).toEqual(mockTags);
    });

    it('태그 목록 조회 실패 시 오류 처리', async () => {
      (tagService.client.get as jest.Mock).mockRejectedValue(new Error('태그 목록 조회에 실패했습니다'));
      
      await expect(tagService.getAllTags()).rejects.toThrow('태그 목록 조회에 실패했습니다');
    });
  });

  describe('getPopularTags', () => {
    it('인기 태그를 성공적으로 조회해야 함', async () => {
      const mockTags: TagWithCount[] = [
        { tag_id: 1, name: '행복', post_count: 15, created_at: '2024-04-25T10:00:00Z', updated_at: '2024-04-25T10:00:00Z' },
        { tag_id: 2, name: '슬픔', post_count: 10, created_at: '2024-04-25T10:00:00Z', updated_at: '2024-04-25T10:00:00Z' }
      ];
      
      (tagService.client.get as jest.Mock).mockResolvedValue({ 
        data: { 
          status: 'success',
          data: mockTags 
        } 
      });
      
      const result = await tagService.getPopularTags(5);
      
      expect(tagService.client.get).toHaveBeenCalledWith('/tags/popular', { params: { limit: 5 } });
      expect(result).toEqual(mockTags);
    });
  });

  describe('createTag', () => {
    it('새 태그를 성공적으로 생성해야 함', async () => {
      const newTagName = '새로운태그';
      const mockTag: Tag = {
        tag_id: 3,
        name: newTagName,
        created_at: '2024-04-25T10:00:00Z',
        updated_at: '2024-04-25T10:00:00Z'
      };
      
      (tagService.client.post as jest.Mock).mockResolvedValue({ 
        data: { 
          status: 'success',
          data: mockTag 
        } 
      });
      
      const result = await tagService.createTag(newTagName);
      
      expect(tagService.client.post).toHaveBeenCalledWith('/tags', { name: newTagName });
      expect(result).toEqual(mockTag);
    });
  });

  describe('searchTags', () => {
    it('태그 검색이 성공적으로 작동해야 함', async () => {
      const mockTags: Tag[] = [
        { tag_id: 1, name: '행복한날', created_at: '2024-04-25T10:00:00Z', updated_at: '2024-04-25T10:00:00Z' },
        { tag_id: 2, name: '행복여행', created_at: '2024-04-25T10:00:00Z', updated_at: '2024-04-25T10:00:00Z' }
      ];
      
      (tagService.client.get as jest.Mock).mockResolvedValue({ 
        data: { 
          status: 'success',
          data: mockTags 
        } 
      });
      
      const result = await tagService.searchTags('행복');
      
      expect(tagService.client.get).toHaveBeenCalledWith('/tags/search', { params: { query: '행복' } });
      expect(result).toEqual(mockTags);
    });
  });

  describe('addTagToPost', () => {
    it('게시물에 태그를 성공적으로 추가해야 함', async () => {
      const postId = 1;
      const tagId = 2;
      const postType = 'my_day';
      
      const mockResponse = {
        status: 'success',
        message: '태그가 게시물에 추가되었습니다'
      };
      
      (tagService.client.post as jest.Mock).mockResolvedValue({ 
        data: mockResponse 
      });
      
      const result = await tagService.addTagToPost(postId, tagId, postType);
      
      expect(tagService.client.post).toHaveBeenCalledWith(
        `/posts/${postId}/tags`, 
        { tag_id: tagId, post_type: postType }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeTagFromPost', () => {
    it('게시물에서 태그를 성공적으로 제거해야 함', async () => {
      const postId = 1;
      const tagId = 2;
      const postType = 'my_day';
      
      const mockResponse = {
        status: 'success',
        message: '태그가 게시물에서 제거되었습니다'
      };
      
      (tagService.client.delete as jest.Mock).mockResolvedValue({ 
        data: mockResponse 
      });
      
      const result = await tagService.removeTagFromPost(postId, tagId, postType);
      
      expect(tagService.client.delete).toHaveBeenCalledWith(
        `/posts/${postId}/tags/${tagId}?post_type=${postType}`
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPostTags', () => {
    it('게시물의 태그를 성공적으로 조회해야 함', async () => {
      const postId = 1;
      const postType = 'my_day';
      
      const mockTags: Tag[] = [
        { tag_id: 1, name: '행복', created_at: '2024-04-25T10:00:00Z', updated_at: '2024-04-25T10:00:00Z' },
        { tag_id: 2, name: '여행', created_at: '2024-04-25T10:00:00Z', updated_at: '2024-04-25T10:00:00Z' }
      ];
      
      (tagService.client.get as jest.Mock).mockResolvedValue({ 
        data: { 
          status: 'success',
          data: mockTags 
        } 
      });
      
      const result = await tagService.getPostTags(postId, postType);
      
      expect(tagService.client.get).toHaveBeenCalledWith(
        `/posts/${postId}/tags?post_type=${postType}`
      );
      expect(result).toEqual(mockTags);
    });
  });
});