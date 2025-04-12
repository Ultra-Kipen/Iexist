// __tests__/integration/services/comfortWallService.integration.test.ts

import comfortWallService from '../../../src/services/api/comfortWallService';
import apiClient from '../../../src/services/api/client';

// apiClient를 모킹
jest.mock('../../../src/services/api/client', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

describe('ComfortWall Service Integration Tests', () => {
  // 각 테스트 전에 모킹 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should successfully create a post', async () => {
      // 모의 응답 설정
      const mockResponse = { 
        status: 201, 
        data: { 
          id: 1, 
          title: '테스트 제목', 
          content: '테스트 내용',
          created_at: '2025-04-09T10:00:00Z'
        } 
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);
      
      // 테스트 실행
      const postData = { 
        title: '테스트 제목', 
        content: '테스트 내용', 
        is_anonymous: true 
      };
      const result = await comfortWallService.createPost(postData);
      
      // 검증
      expect(apiClient.post).toHaveBeenCalledWith('/comfort-wall', postData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when creating a post', async () => {
      // 모의 에러 응답 설정
      const mockError = {
        response: { 
          status: 400, 
          data: { 
            error: '유효성 검증 실패', 
            message: '제목과 내용은 필수입니다.' 
          } 
        }
      };
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);
      
      // 테스트 실행 및 에러 검증
      await expect(comfortWallService.createPost({ title: '', content: '' }))
        .rejects.toEqual(mockError);
    });
  });

  describe('getPosts', () => {
    it('should get posts with default parameters', async () => {
      // 모의 응답 설정
      const mockResponse = { 
        status: 200, 
        data: { 
          posts: [
            { id: 1, title: '첫 번째 글', content: '내용 1' },
            { id: 2, title: '두 번째 글', content: '내용 2' }
          ],
          pagination: { total: 2, page: 1, limit: 10 }
        } 
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
      
      // 테스트 실행
      const result = await comfortWallService.getPosts();
      
      // 검증
      expect(apiClient.get).toHaveBeenCalledWith('/comfort-wall', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should get posts with custom parameters', async () => {
      // 모의 응답 설정
      const mockResponse = { 
        status: 200, 
        data: { 
          posts: [
            { id: 3, title: '인기 글', content: '내용 3' }
          ],
          pagination: { total: 1, page: 1, limit: 10 }
        } 
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
      
      // 테스트 실행
      const params = { page: 1, limit: 10, sort_by: 'popular' as const, tag: '불안' };
      const result = await comfortWallService.getPosts(params);
      
      // 검증
      expect(apiClient.get).toHaveBeenCalledWith('/comfort-wall', { params });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getBestPosts', () => {
    it('should get best posts with specific period', async () => {
      // 모의 응답 설정
      const mockResponse = { 
        status: 200, 
        data: { 
          posts: [
            { id: 5, title: '주간 인기글', content: '내용 5', like_count: 50 }
          ] 
        } 
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
      
      // 테스트 실행
      const params = { period: 'weekly' as const };
      const result = await comfortWallService.getBestPosts(params);
      
      // 검증
      expect(apiClient.get).toHaveBeenCalledWith('/comfort-wall/best', { params });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendMessage', () => {
    it('should send a message to a post', async () => {
      // 모의 응답 설정
      const mockResponse = { 
        status: 201, 
        data: { 
          id: 1, 
          post_id: 5, 
          message: '응원 메시지', 
          created_at: '2025-04-09T11:00:00Z' 
        } 
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);
      
      // 테스트 실행
      const postId = 5;
      const messageData = { message: '응원 메시지', is_anonymous: true };
      const result = await comfortWallService.sendMessage(postId, messageData);
      
      // 검증
      expect(apiClient.post).toHaveBeenCalledWith(`/comfort-wall/${postId}/message`, messageData);
      expect(result).toEqual(mockResponse);
    });
  });
});