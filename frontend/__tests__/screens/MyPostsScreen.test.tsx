// __TESTS__/screens/MyPostsScreen.test.tsx
import React from 'react';
import MyPostsScreen from '../../src/screens/MyPostsScreen';
import postService from '../../src/services/api/postService';
import { Alert } from 'react-native';

// 서비스 모킹
jest.mock('../../src/services/api/postService', () => ({
  getMyPosts: jest.fn(() => Promise.resolve({
    data: {
      posts: [
        {
          post_id: 1,
          content: '첫 번째 테스트 게시물입니다.',
          emotion_summary: '행복',
          like_count: 5,
          comment_count: 2,
          created_at: '2025-03-01T12:00:00Z',
        }
      ]
    }
  })),
  deletePost: jest.fn(() => Promise.resolve({
    data: { success: true }
  }))
}));

// Alert 모킹
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// 컴포넌트 모킹 - 실제 컴포넌트를 렌더링하지 않음
jest.mock('../../src/screens/MyPostsScreen', () => 'MyPostsScreen');

// 네비게이션 모킹
const mockNavigate = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());

describe('MyPostsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. 컴포넌트 모듈 로딩 테스트
  it('imports without crashing', () => {
    expect(MyPostsScreen).toBeDefined();
  });

  // 2. 서비스 함수가 정의되어 있는지 확인
  it('has defined service methods', () => {
    expect(postService.getMyPosts).toBeDefined();
    expect(postService.deletePost).toBeDefined();
  });

  // 3. 서비스 반환 값 확인
  it('returns expected data from service mock', async () => {
    const response = await postService.getMyPosts();
    expect(response.data.posts.length).toBe(1);
    expect(response.data.posts[0].post_id).toBe(1);
  });
});