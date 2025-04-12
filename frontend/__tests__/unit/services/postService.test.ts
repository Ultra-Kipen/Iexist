// __tests__/unit/services/postService.test.ts

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../src/services/api/client';
import postService, { PostCreateData, PostCommentData } from '../../../src/services/api/postService';

// apiClient가 사용하는 axios 인스턴스를 모킹해야 합니다.
// 실제 apiClient.getAxiosInstance()로 가져오거나, 직접 apiClient의 axios 인스턴스를 모킹합니다.
// 여기서는 단순화를 위해 직접 모킹합니다
jest.mock('../../../src/services/api/client', () => {
  return {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn()
  };
});

const mock = new MockAdapter(axios);

describe('postService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createPost 메소드가 올바른 데이터로 POST 요청을 보내야 함', async () => {
    const postData: PostCreateData = {
      content: '오늘은 행복한 하루였어요',
      emotion_summary: '행복',
      is_anonymous: false,
      emotion_ids: [1, 2] // 감정 ID (행복, 감사)
    };

    const responseData = {
      success: true,
      post_id: 1,
      message: '게시물이 성공적으로 생성되었습니다.'
    };

    // axios 모킹 대신 apiClient 직접 모킹
    (apiClient.post as jest.Mock).mockResolvedValue({ data: responseData });

    const response = await postService.createPost(postData);
    expect(response.data).toEqual(responseData);
    expect(apiClient.post).toHaveBeenCalledWith('/posts', postData);
  }, 10000);

  it('getPosts 메소드가 올바른 파라미터로 GET 요청을 보내야 함', async () => {
    const params = {
      page: 1,
      limit: 10,
      emotion: '행복',
      sort_by: 'latest' as const
    };

    const responseData = {
      success: true,
      posts: [
        {
          post_id: 1,
          user_id: 1,
          content: '행복한 하루였어요',
          emotion_summary: '행복',
          like_count: 5,
          comment_count: 2,
          created_at: '2025-04-10T12:00:00Z'
        }
      ],
      total_count: 1
    };

    (apiClient.get as jest.Mock).mockResolvedValue({ data: responseData });

    const response = await postService.getPosts(params);
    expect(response.data).toEqual(responseData);
    expect(apiClient.get).toHaveBeenCalledWith('/posts', { params });
  }, 10000);

  it('getPostById 메소드가 올바른 경로로 GET 요청을 보내야 함', async () => {
    const postId = 1;
    const responseData = {
      success: true,
      post: {
        post_id: 1,
        user_id: 1,
        content: '행복한 하루였어요',
        emotion_summary: '행복',
        like_count: 5,
        comment_count: 2,
        created_at: '2025-04-10T12:00:00Z'
      }
    };

    (apiClient.get as jest.Mock).mockResolvedValue({ data: responseData });

    const response = await postService.getPostById(postId);
    expect(response.data).toEqual(responseData);
    expect(apiClient.get).toHaveBeenCalledWith(`/posts/${postId}`);
  }, 10000);

  it('getMyPosts 메소드가 올바른 파라미터로 GET 요청을 보내야 함', async () => {
    const params = {
      page: 1,
      limit: 5,
      sort_by: 'popular' as const
    };

    const responseData = {
      success: true,
      posts: [
        {
          post_id: 2,
          user_id: 1,
          content: '감사한 하루였어요',
          emotion_summary: '감사',
          like_count: 10,
          comment_count: 3,
          created_at: '2025-04-09T14:30:00Z'
        }
      ],
      total_count: 1
    };

    (apiClient.get as jest.Mock).mockResolvedValue({ data: responseData });

    const response = await postService.getMyPosts(params);
    expect(response.data).toEqual(responseData);
    expect(apiClient.get).toHaveBeenCalledWith('/posts/me', { params });
  }, 10000);

  it('deletePost 메소드가 올바른 경로로 DELETE 요청을 보내야 함', async () => {
    const postId = 1;
    const responseData = {
      success: true,
      message: '게시물이 성공적으로 삭제되었습니다.'
    };

    (apiClient.delete as jest.Mock).mockResolvedValue({ data: responseData });

    const response = await postService.deletePost(postId);
    expect(response.data).toEqual(responseData);
    expect(apiClient.delete).toHaveBeenCalledWith(`/posts/${postId}`);
  }, 10000);

  it('likePost 메소드가 올바른 경로로 POST 요청을 보내야 함', async () => {
    const postId = 1;
    const responseData = {
      success: true,
      like_count: 6,
      message: '좋아요가 추가되었습니다.'
    };

    (apiClient.post as jest.Mock).mockResolvedValue({ data: responseData });

    const response = await postService.likePost(postId);
    expect(response.data).toEqual(responseData);
    expect(apiClient.post).toHaveBeenCalledWith(`/posts/${postId}/like`);
  }, 10000);

  it('addComment 메소드가 올바른 데이터로 POST 요청을 보내야 함', async () => {
    const postId = 1;
    const commentData: PostCommentData = {
      content: '정말 공감되는 이야기네요!',
      is_anonymous: true
    };

    const responseData = {
      success: true,
      comment_id: 1,
      message: '댓글이 성공적으로 추가되었습니다.'
    };

    (apiClient.post as jest.Mock).mockResolvedValue({ data: responseData });

    const response = await postService.addComment(postId, commentData);
    expect(response.data).toEqual(responseData);
    expect(apiClient.post).toHaveBeenCalledWith(`/posts/${postId}/comments`, commentData);
  }, 10000);

  it('getComments 메소드가 올바른 경로로 GET 요청을 보내야 함', async () => {
    const postId = 1;
    const responseData = {
      success: true,
      comments: [
        {
          comment_id: 1,
          post_id: 1,
          user_id: 2,
          content: '정말 공감되는 이야기네요!',
          is_anonymous: true,
          created_at: '2025-04-10T13:15:00Z'
        }
      ],
      total_count: 1
    };

    (apiClient.get as jest.Mock).mockResolvedValue({ data: responseData });

    const response = await postService.getComments(postId);
    expect(response.data).toEqual(responseData);
    expect(apiClient.get).toHaveBeenCalledWith(`/posts/${postId}/comments`);
  }, 10000);

  it('모든 메소드가 에러를 적절히 처리해야 함', async () => {
    const errorResponse = {
      message: '서버 오류가 발생했습니다.',
      status: 500
    };

    const error = new Error('서버 오류가 발생했습니다.');
    (error as any).response = { data: errorResponse, status: 500 };

    // 모든 apiClient 메소드가 에러를 던지도록 설정
    (apiClient.post as jest.Mock).mockRejectedValue(error);
    (apiClient.get as jest.Mock).mockRejectedValue(error);
    (apiClient.delete as jest.Mock).mockRejectedValue(error);

    await expect(postService.createPost({ content: '테스트' })).rejects.toThrow();
    await expect(postService.getPosts()).rejects.toThrow();
    await expect(postService.getPostById(1)).rejects.toThrow();
    await expect(postService.getMyPosts()).rejects.toThrow();
    await expect(postService.deletePost(1)).rejects.toThrow();
    await expect(postService.likePost(1)).rejects.toThrow();
    await expect(postService.addComment(1, { content: '테스트' })).rejects.toThrow();
    await expect(postService.getComments(1)).rejects.toThrow();
  }, 10000);
});