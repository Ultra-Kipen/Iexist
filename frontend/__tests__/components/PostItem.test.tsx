// __tests__/components/PostItem.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PostItem from '../../src/components/PostItem';

describe('PostItem Component', () => {
  const mockOnPress = jest.fn();
  const mockOnLikePress = jest.fn();
  const mockOnCommentPress = jest.fn();
  
  const defaultProps = {
    id: 1,
    content: '오늘은 정말 행복한 하루였어요!',
    userName: '사용자1',
    isAnonymous: false,
    createdAt: '2025-04-12T14:22:30Z',
    likeCount: 5,
    commentCount: 2,
    imageUrl: 'https://example.com/image1.jpg',
    emotions: [
      { id: 1, name: '행복', color: '#FFD700' }
    ],
    onPress: mockOnPress,
    onLikePress: mockOnLikePress,
    onCommentPress: mockOnCommentPress,
    isLiked: false
  };
  
  beforeEach(() => {
    mockOnPress.mockClear();
    mockOnLikePress.mockClear();
    mockOnCommentPress.mockClear();
  });
  
  it('renders post content correctly', () => {
    const { getByText } = render(<PostItem {...defaultProps} />);
    
    expect(getByText(defaultProps.content)).toBeTruthy();
  });
  
  it('displays username correctly', () => {
    const { getByText } = render(<PostItem {...defaultProps} />);
    
    expect(getByText(defaultProps.userName)).toBeTruthy();
  });
  
  it('displays anonymous instead of username when isAnonymous is true', () => {
    const { getByText } = render(
      <PostItem {...defaultProps} isAnonymous={true} />
    );
    
    expect(getByText('익명')).toBeTruthy();
  });
  
  it('renders emotion tags correctly', () => {
    const { getByText } = render(<PostItem {...defaultProps} />);
    
    expect(getByText('행복')).toBeTruthy();
  });
  
  it('calls onPress when post is pressed', () => {
    const { getByText } = render(<PostItem {...defaultProps} />);
    
    fireEvent.press(getByText(defaultProps.content));
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
  
  it('calls onLikePress when like button is pressed', () => {
    const { getByText } = render(<PostItem {...defaultProps} />);
    
    // 하트 아이콘으로 버튼 찾기
    fireEvent.press(getByText('♡'));
    
    expect(mockOnLikePress).toHaveBeenCalledTimes(1);
  });
  
  it('calls onCommentPress when comment button is pressed', () => {
    const { getByText } = render(<PostItem {...defaultProps} />);
    
    // 댓글 아이콘으로 버튼 찾기
    fireEvent.press(getByText('💬'));
    
    expect(mockOnCommentPress).toHaveBeenCalledTimes(1);
  });
  
  it('shows like count when greater than 0', () => {
    const { getByText } = render(<PostItem {...defaultProps} />);
    
    expect(getByText('5')).toBeTruthy();
  });
  
  it('shows different heart icon when liked', () => {
    const { getByText } = render(
      <PostItem {...defaultProps} isLiked={true} />
    );
    
    // 채워진 하트 아이콘(♥)을 확인
    expect(getByText('♥')).toBeTruthy();
  });
});