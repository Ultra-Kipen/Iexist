// __tests__/integration/comfortWallApi.test.ts

import comfortWallService from '../../src/services/api/comfortWallService';
import postService from '../../src/services/api/postService';
import apiClient from '../../src/services/api/client';

// API client 모킹
jest.mock('../../src/services/api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('ComfortWall API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getPosts should call correct API endpoint', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { data: [] }
    });
    
    await comfortWallService.getPosts();
    
    expect(apiClient.get).toHaveBeenCalledWith('/comfort-wall', { params: undefined });
  });

  test('getBestPosts should call correct API endpoint', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { data: [] }
    });
    
    await comfortWallService.getBestPosts();
    
    expect(apiClient.get).toHaveBeenCalledWith('/comfort-wall/best', { params: undefined });
  });

  test('createPost should call correct API endpoint with data', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { message: '게시물이 성공적으로 등록되었습니다.' }
    });
    
    const postData = {
      title: '테스트 게시물',
      content: '테스트 내용',
      is_anonymous: true
    };
    
    await comfortWallService.createPost(postData);
    
    expect(apiClient.post).toHaveBeenCalledWith('/comfort-wall', postData);
  });

  test('sendMessage should call correct API endpoint with data', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { message: '메시지가 성공적으로 전송되었습니다.' }
    });
    
    const messageData = {
      message: '응원 메시지',
      is_anonymous: true
    };
    
    await comfortWallService.sendMessage(1, messageData);
    
    expect(apiClient.post).toHaveBeenCalledWith('/comfort-wall/1/message', messageData);
  });

  test('likePost should call correct API endpoint', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { message: 'success' }
    });
    
    await postService.likePost(1);
    
    expect(apiClient.post).toHaveBeenCalledWith('/posts/1/like');
  });
});