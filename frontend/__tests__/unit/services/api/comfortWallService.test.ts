// __tests__/unit/services/api/comfortWallService.test.ts

import apiClient from '../../../../src/services/api/client';
import comfortWallService, { ComfortWallPostData, ComfortMessageData } from '../../../../src/services/api/comfortWallService';

// Mock apiClient
jest.mock('../../../../src/services/api/client');

describe('comfortWallService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should call apiClient.post with correct parameters', async () => {
      const mockData: ComfortWallPostData = {
        title: '테스트 제목',
        content: '테스트 내용',
        is_anonymous: true,
        tag_ids: [1, 2, 3],
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: 'success' });

      const result = await comfortWallService.createPost(mockData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/comfort-wall', mockData);
      expect(result).toEqual({ data: 'success' });
    });
  });

  describe('getPosts', () => {
    it('should call apiClient.get with correct parameters', async () => {
      const params = { 
        page: 1, 
        limit: 10, 
        sort_by: 'latest' as const,
        tag: 'test'
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: ['post1', 'post2'] });

      const result = await comfortWallService.getPosts(params);
      
      expect(apiClient.get).toHaveBeenCalledWith('/comfort-wall', { params });
      expect(result).toEqual({ data: ['post1', 'post2'] });
    });

    it('should call apiClient.get without parameters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: ['post1', 'post2'] });

      const result = await comfortWallService.getPosts();
      
      expect(apiClient.get).toHaveBeenCalledWith('/comfort-wall', { params: undefined });
      expect(result).toEqual({ data: ['post1', 'post2'] });
    });
  });

  describe('getBestPosts', () => {
    it('should call apiClient.get with correct parameters', async () => {
      const params = { period: 'weekly' as const };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: ['bestPost1', 'bestPost2'] });

      const result = await comfortWallService.getBestPosts(params);
      
      expect(apiClient.get).toHaveBeenCalledWith('/comfort-wall/best', { params });
      expect(result).toEqual({ data: ['bestPost1', 'bestPost2'] });
    });

    it('should call apiClient.get without parameters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: ['bestPost1', 'bestPost2'] });

      const result = await comfortWallService.getBestPosts();
      
      expect(apiClient.get).toHaveBeenCalledWith('/comfort-wall/best', { params: undefined });
      expect(result).toEqual({ data: ['bestPost1', 'bestPost2'] });
    });
  });

  describe('sendMessage', () => {
    it('should call apiClient.post with correct parameters', async () => {
      const postId = 123;
      const mockData: ComfortMessageData = {
        message: '테스트 메시지',
        is_anonymous: true
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: 'success' });

      const result = await comfortWallService.sendMessage(postId, mockData);
      
      expect(apiClient.post).toHaveBeenCalledWith(`/comfort-wall/${postId}/message`, mockData);
      expect(result).toEqual({ data: 'success' });
    });
  });
});