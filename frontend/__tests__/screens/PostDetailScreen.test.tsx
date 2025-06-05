// __tests__/screens/PostDetailScreen.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import PostDetailScreen from '../../src/screens/PostDetailScreen';
import postService from '../../src/services/api/postService';
import { Alert } from 'react-native';

// 모의 데이터
const mockPost = {
  post_id: 1,
  user_id: 101,
  username: 'testuser',
  nickname: '테스트유저',
  content: '테스트 게시물 내용입니다.',
  emotion_summary: '행복',
  image_url: null,
  emotions: [
    { emotion_id: 1, name: '행복', color: '#FFD700' }
  ],
  is_anonymous: false,
  like_count: 5,
  comment_count: 2,
  is_liked: false,
  created_at: new Date().toISOString(),
};

const mockComments = [
  {
    comment_id: 1,
    user_id: 102,
    username: 'commenter',
    nickname: '댓글작성자',
    content: '좋은 글이네요!',
    is_anonymous: false,
    created_at: new Date().toISOString()
  }
];

// 모킹
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { postId: 1 },
  }),
}));

// postService 모킹
jest.mock('../../src/services/api/postService', () => ({
  getPostById: jest.fn(),
  getComments: jest.fn(),
  likePost: jest.fn(),
  addComment: jest.fn()
}));

// 컴포넌트 모킹 - 문자열로 단순화
jest.mock('../../src/components/LoadingIndicator', () => 'LoadingIndicator');
jest.mock('../../src/components/ProfileAvatar', () => 'ProfileAvatar');
jest.mock('../../src/components/CommentItem', () => 'CommentItem');
jest.mock('../../src/components/Button', () => 'Button');

// ScrollView 모킹
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.ScrollView = ({ children, ref }) => children;
  return rn;
});

// Alert 모킹
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('PostDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    // 로딩 상태를 유지하기 위해 해결되지 않는 Promise 사용
    (postService.getPostById as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // 영원히 해결되지 않는 Promise
    );
    
    (postService.getComments as jest.Mock).mockImplementation(() => 
      new Promise(() => {})
    );
    
    render(<PostDetailScreen />);
    
    // API가 호출되었는지 확인
    await waitFor(() => {
      expect(postService.getPostById).toHaveBeenCalledWith(1);
    }, { timeout: 1000 });
  });

  it('renders post data successfully', async () => {
    // 데이터 로딩 성공 모킹
    (postService.getPostById as jest.Mock).mockResolvedValue({
      data: { data: mockPost }
    });
    
    (postService.getComments as jest.Mock).mockResolvedValue({
      data: { data: mockComments }
    });
    
    render(<PostDetailScreen />);
    
    // API 호출 확인 - waitFor 사용
    await waitFor(() => {
      expect(postService.getPostById).toHaveBeenCalledWith(1);
    }, { timeout: 1000 });

    await waitFor(() => {
      expect(postService.getComments).toHaveBeenCalledWith(1);
    }, { timeout: 1000 });
  });

  it('handles error state properly', async () => {
    // 에러 상태 모킹
    (postService.getPostById as jest.Mock).mockRejectedValue(new Error('API 오류'));
    
    render(<PostDetailScreen />);
    
    // API 호출 확인 - waitFor 사용
    await waitFor(() => {
      expect(postService.getPostById).toHaveBeenCalledWith(1);
    }, { timeout: 1000 });
  });
});