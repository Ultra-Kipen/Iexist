// tests/components/ComfortWallPost.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ComfortWallPost from '../../src/components/ComfortWallPost';

// 이미지 모킹
jest.mock('../../assets/images/default_avatar.png', () => 'default_avatar');
jest.mock('../../assets/images/anonymous_avatar.png', () => 'anonymous_avatar');

describe('ComfortWallPost', () => {
  const mockPost = {
    post_id: 1,
    title: '테스트 게시물',
    content: '이것은 테스트 게시물 내용입니다.',
    created_at: '2025-04-20T12:34:56.000Z',
    like_count: 10,
    comment_count: 5,
    is_anonymous: false,
    user: {
      nickname: '테스터',
      profile_image_url: 'https://example.com/profile.jpg',
    },
    comments: [
      {
        comment_id: 1,
        user_id: 2,
        content: '첫 번째 댓글입니다.',
        is_anonymous: false,
        created_at: '2025-04-20T13:00:00.000Z',
        user: {
          nickname: '댓글작성자',
        },
      },
      {
        comment_id: 2,
        user_id: 3,
        content: '두 번째 댓글입니다.',
        is_anonymous: true,
        created_at: '2025-04-20T13:10:00.000Z',
      },
    ],
  };

  const mockHandlers = {
    onLikePress: jest.fn(),
    onCommentPress: jest.fn(),
    onPostPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders post details correctly', () => {
    const { getByText } = render(
      <ComfortWallPost post={mockPost} {...mockHandlers} />
    );
    
    expect(getByText('테스트 게시물')).toBeTruthy();
    expect(getByText('이것은 테스트 게시물 내용입니다.')).toBeTruthy();
    expect(getByText('테스터')).toBeTruthy();
    expect(getByText(/♥ 좋아요 10/)).toBeTruthy();
    expect(getByText(/💬 댓글 5/)).toBeTruthy();
  });

  it('displays formatted date correctly', () => {
    const { getByText } = render(
      <ComfortWallPost post={mockPost} {...mockHandlers} />
    );
    
    // 날짜 형식을 확인 (2025년 04월 20일 12:34 형식)
    expect(getByText(/2025년 04월 20일/)).toBeTruthy();
  });

  it('shows anonymous user when post is anonymous', () => {
    const anonymousPost = {
      ...mockPost,
      is_anonymous: true,
    };
    
    const { getByText } = render(
      <ComfortWallPost post={anonymousPost} {...mockHandlers} />
    );
    
    expect(getByText('익명')).toBeTruthy();
  });

  it('truncates long content and shows "더 보기" button', () => {
    const longContentPost = {
      ...mockPost,
      content: 'A'.repeat(200), // 최대 길이(150)보다 긴 내용
    };
    
    const { getByText } = render(
      <ComfortWallPost post={longContentPost} {...mockHandlers} />
    );
    
    expect(getByText('더 보기')).toBeTruthy();
    
    // 더 보기 버튼을 클릭하면 전체 내용이 표시되고 버튼 텍스트가 바뀌어야 함
    fireEvent.press(getByText('더 보기'));
    expect(getByText('접기')).toBeTruthy();
  });

// 수정 후
// 수정 후
it('displays image when image_url is provided', () => {
    const postWithImage = {
      ...mockPost,
      image_url: 'https://example.com/image.jpg',
    };
    
    const { getByTestId } = render(
      <ComfortWallPost post={postWithImage} {...mockHandlers} />
    );
    
    // ComfortWallPost 컴포넌트에 testID를 추가하고 그것을 사용
    const postImage = getByTestId('post-image');
    expect(postImage.props.source).toEqual({ uri: 'https://example.com/image.jpg' });
  });
  it('calls onLikePress when like button is pressed', () => {
    const { getByText } = render(
      <ComfortWallPost post={mockPost} {...mockHandlers} />
    );
    
    fireEvent.press(getByText(/♥ 좋아요 10/));
    expect(mockHandlers.onLikePress).toHaveBeenCalledWith(mockPost.post_id);
    
    // 좋아요 상태가 변경되었는지 확인
    expect(getByText(/♥ 좋아요 11/)).toBeTruthy();
  });

  it('calls onCommentPress when comment button is pressed', () => {
    const { getByText } = render(
      <ComfortWallPost post={mockPost} {...mockHandlers} />
    );
    
    fireEvent.press(getByText(/💬 댓글 5/));
    expect(mockHandlers.onCommentPress).toHaveBeenCalledWith(mockPost.post_id);
  });

  it('calls onPostPress when post title is pressed', () => {
    const { getByText } = render(
      <ComfortWallPost post={mockPost} {...mockHandlers} />
    );
    
    fireEvent.press(getByText('테스트 게시물'));
    expect(mockHandlers.onPostPress).toHaveBeenCalledWith(mockPost.post_id);
  });

  it('shows comment previews', () => {
    const { getByText } = render(
      <ComfortWallPost post={mockPost} {...mockHandlers} />
    );
    
    expect(getByText('댓글작성자:')).toBeTruthy();
    expect(getByText('첫 번째 댓글입니다.')).toBeTruthy();
    expect(getByText('익명:')).toBeTruthy();
    expect(getByText('두 번째 댓글입니다.')).toBeTruthy();
  });

  it('handles pre-liked state correctly', () => {
    const { getByText } = render(
      <ComfortWallPost post={mockPost} {...mockHandlers} isLiked={true} />
    );
    
    // 이미 좋아요 상태인 버튼 스타일 확인 (텍스트 스타일만 확인 가능)
    const likeButton = getByText(/♥ 좋아요 10/);
    expect(likeButton).toBeTruthy();
    
    // 좋아요 취소
    fireEvent.press(likeButton);
    expect(mockHandlers.onLikePress).toHaveBeenCalledWith(mockPost.post_id);
    
    // 좋아요 수가 감소했는지 확인
    expect(getByText(/♥ 좋아요 9/)).toBeTruthy();
  });
});