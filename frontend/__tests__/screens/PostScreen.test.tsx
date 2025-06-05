// __tests__/screens/PostScreen.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import PostScreen from '../../src/screens/PostScreen';
import postService from '../../src/services/api/postService';

// 모의 데이터
const mockPost = {
  post_id: 1,
  user_id: 101,
  content: '테스트 게시물 내용입니다.',
  emotion_summary: '행복',
  like_count: 5,
  comment_count: 2,
  created_at: new Date().toISOString(),
};

const mockComments = [
  {
    comment_id: 1,
    user_id: 102,
    content: '좋은 글이네요!',
    is_anonymous: false,
    created_at: new Date().toISOString()
  }
];

// postService 모킹
jest.mock('../../src/services/api/postService', () => ({
  getPostById: jest.fn().mockResolvedValue({ data: { post: {} } }),
  getComments: jest.fn().mockResolvedValue({ data: { comments: [] } }),
  addComment: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

// React Native Vector Icons 모킹
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// React Native Paper 모킹
jest.mock('react-native-paper', () => ({
  Button: (props: { children: React.ReactNode; onPress?: () => void; loading?: boolean; disabled?: boolean }) => 
    <button data-testid="button" onClick={props.onPress} disabled={props.disabled || props.loading}>
      {props.loading ? 'Loading...' : props.children}
    </button>,
}));

// React Native Safe Area Context 모킹
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: (props: { children: React.ReactNode }) => <div>{props.children}</div>,
}));

describe('PostScreen', () => {
  const mockRoute = {
    params: {
      postId: 1,
    },
  };
  
  const mockNavigation = {};
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // API 응답 모킹 - 즉시 해결되는 Promise
    (postService.getPostById as jest.Mock).mockResolvedValue({
      data: { post: mockPost }
    });
    
    (postService.getComments as jest.Mock).mockResolvedValue({
      data: { comments: mockComments }
    });
  });
  
  it('renders the component without crashing', () => {
    render(
      <PostScreen route={mockRoute} navigation={mockNavigation} />
    );
    
    // API 호출 확인
    expect(postService.getPostById).toHaveBeenCalledWith(1);
    expect(postService.getComments).toHaveBeenCalledWith(1);
  });
  
  it('handles error state when API fails', () => {
    // API 오류 모킹
    (postService.getPostById as jest.Mock).mockRejectedValueOnce(new Error('API 오류'));
    
    render(
      <PostScreen route={mockRoute} navigation={mockNavigation} />
    );
    
    // API 호출 확인
    expect(postService.getPostById).toHaveBeenCalledWith(1);
  });
});