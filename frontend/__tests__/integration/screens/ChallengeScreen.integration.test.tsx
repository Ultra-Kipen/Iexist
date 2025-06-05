// __TESTS__/screens/MyPostsScreen.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import MyPostsScreen from '../../../src/screens/MyPostsScreen';
import postService from '../../../src/services/api/postService';
import { Alert } from 'react-native';
import { AxiosResponse } from 'axios';

// 타입 정의
type MockFn<T extends (...args: any[]) => any> = jest.Mock<ReturnType<T>, Parameters<T>>;

// 모킹
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn().mockReturnValue(jest.fn()),
  }),
}));

jest.mock('../../../src/services/api/postService', () => ({
  getMyPosts: jest.fn(),
  deletePost: jest.fn(),
}));

// Paper 모킹 개선 - 인라인 타입 주석 사용
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  

  // 간단한 버튼 컴포넌트
  const Button = (props: { onPress?: any; mode?: string; style?: any; testID?: any; textColor?: any; children?: any; }) => (
    <TouchableOpacity 
      onPress={props.onPress} 
      style={{ 
        backgroundColor: props.mode === 'contained' ? '#2196F3' : 'transparent',
        borderWidth: props.mode === 'outlined' ? 1 : 0,
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        ...(props.style || {})
      }}
      testID={props.testID}
    >
      <Text style={{ color: props.textColor || (props.mode === 'contained' ? 'white' : '#2196F3') }}>
        {props.children}
      </Text>
    </TouchableOpacity>
  );
  
  // 간단한 카드 컴포넌트
  const Card = (props: { style?: any; testID?: any; children?: any; }) => (
    <View style={[{ margin: 8, padding: 8, backgroundColor: 'white' }, props.style]} testID={props.testID}>
      {props.children}
    </View>
  );
  
  Card.Content = (props: { children?: any; }) => <View style={{ padding: 8 }}>{props.children}</View>;
  Card.Actions = (props: { children?: any; }) => <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 8 }}>{props.children}</View>;
  
  // Dialog 관련 컴포넌트
  const Dialog = (props: { visible?: any; children?: any; onDismiss?: any; }) => {
    if (!props.visible) return null;
    return (
      <View 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
      >
        <View style={{ backgroundColor: 'white', padding: 16, width: '80%', borderRadius: 8 }}>
          {props.children}
        </View>
      </View>
    );
  };
  
  Dialog.Title = (props: { children?: any; }) => <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{props.children}</Text>;
  Dialog.Content = (props: { children?: any; }) => <View style={{ marginVertical: 8 }}>{props.children}</View>;
  Dialog.Actions = (props: { children?: any; }) => <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>{props.children}</View>;
  
  // Chip 컴포넌트
  const Chip = (props: { style?: any; icon?: () => any; children?: any; }) => (
    <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e0e0', borderRadius: 16, padding: 4 }, props.style]}>
      {props.icon && props.icon()}
      <Text style={{ marginLeft: 4 }}>{props.children}</Text>
    </View>
  );
  
  // Portal 컴포넌트
  const Portal = (props: { children?: any; }) => props.children;

  return {
    Button,
    Card,
    Chip,
    Dialog,
    Portal,
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  
  return function MockIcon(props: { name?: any; size?: any; color?: any; }) {
    return <Text>{props.name}</Text>;
  };
});

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// 테스트 데이터
const mockPosts = [
  {
    post_id: 1,
    content: '첫 번째 테스트 게시물입니다.',
    emotion_summary: '행복',
    like_count: 5,
    comment_count: 2,
    created_at: '2025-03-01T12:00:00Z',
  },
  {
    post_id: 2,
    content: '두 번째 테스트 게시물입니다.',
    emotion_summary: '슬픔',
    like_count: 2,
    comment_count: 1,
    created_at: '2025-03-02T12:00:00Z',
  },
];

// Axios 응답 모킹 헬퍼 함수
function createMockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

describe('MyPostsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 타입 어설션 추가
    (postService.getMyPosts as MockFn<typeof postService.getMyPosts>).mockResolvedValue(
      createMockResponse({ posts: mockPosts })
    );
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders post list correctly', async () => {
    const mockAddListener = jest.fn().mockReturnValue(jest.fn());
    
    render(<MyPostsScreen navigation={{ navigate: jest.fn(), addListener: mockAddListener }} route={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('내 게시물')).toBeTruthy();
      expect(screen.getByText('첫 번째 테스트 게시물입니다.')).toBeTruthy();
      expect(screen.getByText('두 번째 테스트 게시물입니다.')).toBeTruthy();
    });
  });

  it('navigates to create post screen', async () => {
    const navigate = jest.fn();
    
    render(<MyPostsScreen navigation={{ navigate, addListener: jest.fn().mockReturnValue(jest.fn()) }} route={{}} />);
    
    await waitFor(() => {
      const newPostButton = screen.getByText('새 게시물');
      fireEvent.press(newPostButton);
    });
    
    expect(navigate).toHaveBeenCalledWith('CreatePost');
  });

  it('shows empty state when no posts', async () => {
    (postService.getMyPosts as MockFn<typeof postService.getMyPosts>).mockResolvedValue(
      createMockResponse({ posts: [] })
    );
    
    render(<MyPostsScreen navigation={{ navigate: jest.fn(), addListener: jest.fn().mockReturnValue(jest.fn()) }} route={{}} />);
    
    await waitFor(() => {
      expect(screen.getByText('게시물이 없습니다')).toBeTruthy();
      expect(screen.getByText('첫 게시물 작성하기')).toBeTruthy();
    });
  });

  it('handles post deletion', async () => {
    (postService.deletePost as MockFn<typeof postService.deletePost>).mockResolvedValue(
      createMockResponse({ success: true })
    );
    
    render(<MyPostsScreen navigation={{ navigate: jest.fn(), addListener: jest.fn().mockReturnValue(jest.fn()) }} route={{}} />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.press(deleteButtons[0]);
    });
    
    expect(screen.getByText('게시물 삭제')).toBeTruthy();
    expect(screen.getByText('정말로 이 게시물을 삭제하시겠습니까?')).toBeTruthy();
    
    const confirmDeleteButton = screen.getAllByText('삭제')[screen.getAllByText('삭제').length - 1];
    fireEvent.press(confirmDeleteButton);
    
    await waitFor(() => {
      expect(postService.deletePost).toHaveBeenCalledWith(1);
      expect(Alert.alert).toHaveBeenCalledWith('성공', '게시물이 성공적으로 삭제되었습니다');
    });
  });

  it('handles deletion cancellation', async () => {
    render(<MyPostsScreen navigation={{ navigate: jest.fn(), addListener: jest.fn().mockReturnValue(jest.fn()) }} route={{}} />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.press(deleteButtons[0]);
    });
    
    const cancelButton = screen.getByText('취소');
    fireEvent.press(cancelButton);
    
    expect(postService.deletePost).not.toHaveBeenCalled();
  });

  it('handles error during deletion', async () => {
    (postService.deletePost as MockFn<typeof postService.deletePost>).mockRejectedValue({
      response: {
        status: 500,
        data: { message: '네트워크 오류' }
      }
    });
    
    render(<MyPostsScreen navigation={{ navigate: jest.fn(), addListener: jest.fn().mockReturnValue(jest.fn()) }} route={{}} />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.press(deleteButtons[0]);
    });
    
    const confirmDeleteButton = screen.getAllByText('삭제')[screen.getAllByText('삭제').length - 1];
    fireEvent.press(confirmDeleteButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('오류', '게시물을 삭제하는 중 오류가 발생했습니다');
    });
  });

  it('handles error during data loading', async () => {
    (postService.getMyPosts as MockFn<typeof postService.getMyPosts>).mockRejectedValue({
      response: {
        status: 500,
        data: { message: '네트워크 오류' }
      }
    });
    
    render(<MyPostsScreen navigation={{ navigate: jest.fn(), addListener: jest.fn().mockReturnValue(jest.fn()) }} route={{}} />);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('오류', '게시물을 불러오는 중 오류가 발생했습니다');
    });
  });

  it('navigates to post detail screen', async () => {
    const navigate = jest.fn();
    render(<MyPostsScreen navigation={{ navigate, addListener: jest.fn().mockReturnValue(jest.fn()) }} route={{}} />);
    
    await waitFor(() => {
      const detailButtons = screen.getAllByText('자세히');
      fireEvent.press(detailButtons[0]);
    });
    
    expect(navigate).toHaveBeenCalledWith('Post', { postId: 1 });
  });
});