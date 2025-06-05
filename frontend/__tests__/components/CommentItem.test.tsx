// tests/components/CommentItem.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CommentItem from '../../src/components/CommentItem';

describe('CommentItem', () => {
  const mockProps = {
    id: 1,
    content: '테스트 댓글입니다.',
    userName: '홍길동',
    isAnonymous: false,
    createdAt: '2025-04-20T14:30:00.000Z',
    onReply: jest.fn(),
    onLike: jest.fn(),
    likeCount: 5,
  };

  it('renders correctly with user name', () => {
    const { getByText } = render(<CommentItem {...mockProps} />);
    expect(getByText('홍길동')).toBeTruthy();
    expect(getByText('테스트 댓글입니다.')).toBeTruthy();
    expect(getByText('공감 5')).toBeTruthy();
    expect(getByText('답글')).toBeTruthy();
  });

  it('displays anonymous instead of username when isAnonymous is true', () => {
    const anonymousProps = { ...mockProps, isAnonymous: true };
    const { getByText } = render(<CommentItem {...anonymousProps} />);
    expect(getByText('익명')).toBeTruthy();
  });

  it('calls onLike when like button is pressed', () => {
    const { getByText } = render(<CommentItem {...mockProps} />);
    fireEvent.press(getByText('공감 5'));
    expect(mockProps.onLike).toHaveBeenCalledTimes(1);
  });

  it('calls onReply when reply button is pressed', () => {
    const { getByText } = render(<CommentItem {...mockProps} />);
    fireEvent.press(getByText('답글'));
    expect(mockProps.onReply).toHaveBeenCalledTimes(1);
  });

  it('formats date correctly', () => {
    const { getByText } = render(<CommentItem {...mockProps} />);
    // 실제 표시되는 날짜 형식에 맞게 정규식 수정
    const dateText = getByText(/\d{4}\.\s\d{2}\.\s\d{2}\.\s\d{2}:\d{2}/);
    expect(dateText).toBeTruthy();
  });
  
  it('handles null or empty values gracefully', () => {
    const minimalProps = {
      id: 1,
      content: '',
      userName: '',
      isAnonymous: false,
      createdAt: '',
    };
    const { getByTestId } = render(<CommentItem {...minimalProps} />);
    // 빈 content 확인을 위해 testID 속성 활용
    expect(getByTestId('content').props.children).toBe('');
  });
  it('does not show like count when it is 0', () => {
    const propsWithZeroLikes = { ...mockProps, likeCount: 0 };
    const { getByText } = render(<CommentItem {...propsWithZeroLikes} />);
    expect(getByText('공감')).toBeTruthy(); // 좋아요 카운트가 표시되지 않음
  });

  it('does not render like button when onLike is not provided', () => {
    const { onLike, ...propsWithoutLike } = mockProps;
    const { queryByText } = render(<CommentItem {...propsWithoutLike} />);
    expect(queryByText('공감')).toBeNull();
  });

  it('does not render reply button when onReply is not provided', () => {
    const { onReply, ...propsWithoutReply } = mockProps;
    const { queryByText } = render(<CommentItem {...propsWithoutReply} />);
    expect(queryByText('답글')).toBeNull();
  });
});