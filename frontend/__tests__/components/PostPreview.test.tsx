import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Image } from 'react-native';
import PostPreview from '../../src/components/PostPreview';

// 이미지 모킹
jest.mock('../../src/assets/images/default_avatar.png', () => 'default_avatar');
jest.mock('../../src/assets/images/anonymous_avatar.png', () => 'anonymous_avatar');

describe('PostPreview', () => {
  const mockEmotions = [
    { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
    { emotion_id: 5, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4' },
  ];

  const mockTags = [
    { tag_id: 1, name: '일상' },
    { tag_id: 2, name: '고민' },
  ];

  const mockMyDayPost = {
    post_id: 1,
    content: '오늘은 정말 행복한 하루였습니다!',
    created_at: '2025-04-20T12:00:00.000Z',
    like_count: 5,
    comment_count: 3,
    is_anonymous: false,
    user: {
      nickname: '행복이',
      profile_image_url: 'https://example.com/happy.jpg',
    },
    emotions: mockEmotions,
  };

  const mockSomeoneDayPost = {
    post_id: 2,
    title: '요즘 고민이 있어요',
    content: '이런저런 고민이 많아서 글을 남겨봅니다.',
    created_at: '2025-04-19T15:30:00.000Z',
    like_count: 10,
    comment_count: 7,
    is_anonymous: true,
    tags: mockTags,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders myDay post correctly', () => {
    const { getByText } = render(
      <PostPreview postType="myDay" post={mockMyDayPost} onPress={mockOnPress} />
    );
    
    expect(getByText('행복이')).toBeTruthy();
    expect(getByText('오늘은 정말 행복한 하루였습니다!')).toBeTruthy();
    expect(getByText('5')).toBeTruthy(); // 좋아요 수
    expect(getByText('3')).toBeTruthy(); // 댓글 수
    
    // 감정 태그 확인
    expect(getByText('행복')).toBeTruthy();
    expect(getByText('슬픔')).toBeTruthy();
  });

  it('renders someoneDay post correctly', () => {
    const { getByText } = render(
      <PostPreview postType="someoneDay" post={mockSomeoneDayPost} onPress={mockOnPress} />
    );
    
    expect(getByText('익명')).toBeTruthy();
    expect(getByText('요즘 고민이 있어요')).toBeTruthy();
    expect(getByText('이런저런 고민이 많아서 글을 남겨봅니다.')).toBeTruthy();
    expect(getByText('10')).toBeTruthy(); // 좋아요 수
    expect(getByText('7')).toBeTruthy(); // 댓글 수
    // __tests__/components/PostPreview.test.tsx (계속)
    
    // 태그 확인
    expect(getByText('#일상')).toBeTruthy();
    expect(getByText('#고민')).toBeTruthy();
  });

  it('renders comfort post correctly', () => {
    const comfortPost = {
      ...mockSomeoneDayPost,
      title: '위로가 필요해요',
    };
    
    const { getByText } = render(
      <PostPreview postType="comfort" post={comfortPost} onPress={mockOnPress} />
    );
    
    expect(getByText('위로가 필요해요')).toBeTruthy();
  });

// PostPreview.test.tsx의 해당 테스트 수정
it('formats date correctly', () => {
    const { getByText } = render(
      <PostPreview 
        postType="myDay" 
        post={{
          ...mockMyDayPost,
          created_at: '2025-04-20T12:00:00.000Z' // UTC 시간을 명시적으로 지정
        }} 
        onPress={mockOnPress} 
      />
    );
    
    // 렌더링된 날짜 텍스트를 검증
    const dateElement = getByText(/2025-04-20 \d{2}:\d{2}/);
    expect(dateElement).toBeTruthy();
  });
  it('truncates long content', () => {
    const longContentPost = {
      ...mockMyDayPost,
      content: 'A'.repeat(150), // 100자 이상의 내용
    };
    
    const { getByText } = render(
      <PostPreview postType="myDay" post={longContentPost} onPress={mockOnPress} />
    );
    
    // 내용이 잘렸는지 확인 (ellipsis가 포함되어 있는지)
    expect(getByText(/A{100,}\.{3}/)).toBeTruthy();
  });

  it('displays image when provided', () => {
    const postWithImage = {
      ...mockMyDayPost,
      image_url: 'https://example.com/image.jpg',
    };
    
    const { getByTestId } = render(
      <PostPreview postType="myDay" post={postWithImage} onPress={mockOnPress} />
    );
    
    // testID를 사용하여 이미지 확인
    const postImage = getByTestId('post-image');
    
    expect(postImage.props.source.uri).toBe('https://example.com/image.jpg');
  });

  it('calls onPress with post_id when pressed', () => {
    const { getByText } = render(
      <PostPreview postType="myDay" post={mockMyDayPost} onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('오늘은 정말 행복한 하루였습니다!'));
    
    expect(mockOnPress).toHaveBeenCalledWith(mockMyDayPost.post_id);
  });

  it('handles anonymous post correctly', () => {
    const anonymousMyDayPost = {
      ...mockMyDayPost,
      is_anonymous: true,
      user: null, // 익명 사용자는 user 정보가 없을 수도 있음
    };
    
    const { getByText } = render(
      <PostPreview postType="myDay" post={anonymousMyDayPost} onPress={mockOnPress} />
    );
    
    expect(getByText('익명')).toBeTruthy();
  });

  it('handles missing emotions and tags gracefully', () => {
    const postWithoutEmotions = {
      ...mockMyDayPost,
      emotions: undefined,
    };
    
    const postWithoutTags = {
      ...mockSomeoneDayPost,
      tags: undefined,
    };
    
    // 감정 태그가 없는 경우
    const { queryByText: queryMyDay } = render(
      <PostPreview postType="myDay" post={postWithoutEmotions} onPress={mockOnPress} />
    );
    
    expect(queryMyDay('행복')).toBeNull(); // 감정 태그가 표시되지 않아야 함
    
    // 일반 태그가 없는 경우
    const { queryByText: querySomeoneDay } = render(
      <PostPreview postType="someoneDay" post={postWithoutTags} onPress={mockOnPress} />
    );
    
    expect(querySomeoneDay('#일상')).toBeNull(); // 태그가 표시되지 않아야 함
  });

  it('handles missing title for someoneDay and comfort posts', () => {
    const postWithoutTitle = {
      ...mockSomeoneDayPost,
      title: undefined,
    };
    
    // someoneDay 포스트에 제목이 없는 경우 - 제목이 표시되지 않아야 함
    const { queryByText } = render(
      <PostPreview postType="someoneDay" post={postWithoutTitle} onPress={mockOnPress} />
    );
    
    expect(queryByText('요즘 고민이 있어요')).toBeNull();
    // 하지만 내용은 표시되어야 함
    expect(queryByText('이런저런 고민이 많아서 글을 남겨봅니다.')).toBeTruthy();
  });

  it('renders correctly with empty arrays of emotions and tags', () => {
    const postWithEmptyArrays = {
      ...mockMyDayPost,
      emotions: [],
    };
    
    const someoneDayPostWithEmptyArrays = {
      ...mockSomeoneDayPost,
      tags: [],
    };
    
    // 빈 emotions 배열
    const { queryByText: queryMyDay } = render(
      <PostPreview postType="myDay" post={postWithEmptyArrays} onPress={mockOnPress} />
    );
    
    // 빈 tags 배열
    const { queryByText: querySomeoneDay } = render(
      <PostPreview postType="someoneDay" post={someoneDayPostWithEmptyArrays} onPress={mockOnPress} />
    );
    
    // 포스트의 나머지 내용은 정상적으로 렌더링되어야 함
    expect(queryMyDay('오늘은 정말 행복한 하루였습니다!')).toBeTruthy();
    expect(querySomeoneDay('이런저런 고민이 많아서 글을 남겨봅니다.')).toBeTruthy();
  });

  it('handles invalid date format gracefully', () => {
    const postWithInvalidDate = {
      ...mockMyDayPost,
      created_at: 'invalid-date',
    };
    
    // 잘못된 날짜 형식에도 오류 없이 렌더링되어야 함
    const { getByText } = render(
      <PostPreview postType="myDay" post={postWithInvalidDate} onPress={mockOnPress} />
    );
    
    expect(getByText('오늘은 정말 행복한 하루였습니다!')).toBeTruthy();
    // 날짜가 잘못되었더라도 오류가 발생하지 않아야 함
  });
});