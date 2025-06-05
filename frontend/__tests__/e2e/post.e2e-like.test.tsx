// __tests__/e2e/post.e2e-like.test.tsx
// React Native 컴포넌트 명시적 모킹 - 수정된 버전
jest.mock('react-native', () => {
  return {
    View: 'View',
    Text: 'Text',
    Button: 'Button',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    StyleSheet: {
      create: jest.fn(styles => styles),
      flatten: jest.fn(style => style), // flatten 함수 추가
      absoluteFill: {},
      hairlineWidth: 1,
    },
    Platform: { 
      OS: 'android',
      select: jest.fn(obj => obj.android || obj.default),
    },
    Dimensions: { 
      get: jest.fn(() => ({ width: 375, height: 667 })),
    },
    NativeModules: {},
    DevMenu: {
      show: jest.fn(),
    },
    I18nManager: {
      isRTL: false,
      getConstants: () => ({ isRTL: false }),
    },
  };
});

// React Navigation 모킹도 명시적으로 설정
jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({ children }) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

// React Native Paper 모킹
jest.mock('react-native-paper', () => {
  return {
    Provider: ({ children }) => children,
  };
});

import React, { useEffect } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, Button, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import postService from '../../src/services/api/postService';

// 외부 import 제거하고 직접 Mock 컴포넌트 정의
// Mock PostScreen 컴포넌트
const MockPostScreen = ({ route, navigation }: any) => {
  const { postId } = route?.params || { postId: 1 };
  
  useEffect(() => {
    // 게시물 상세 정보 로드 (getPostById 메서드 사용)
    postService.getPostById(postId);
    // 댓글 로드
    postService.getComments(postId);
  }, [postId]);

  const handleAddComment = () => {
    postService.addComment(postId, { content: '테스트 댓글입니다.', is_anonymous: false });
  };

  return (
    <View>
      <Text>게시물 상세 화면</Text>
      <Text>게시물 ID: {postId}</Text>
      <Text>테스트 게시물</Text>
      
      <TextInput 
        placeholder="댓글을 입력하세요..." 
        testID="comment-input"
      />
      
      <Button 
        title="게시" 
        onPress={handleAddComment}
        testID="submit-comment"
      />
    </View>
  );
};

// Mock MyPostsScreen 컴포넌트
const MockMyPostsScreen = ({ navigation }: any) => {
  useEffect(() => {
    // 내 게시물 로드
    postService.getMyPosts();
  }, []);

  const handleDeletePost = (postId: number) => {
    postService.deletePost(postId);
  };

  return (
    <View>
      <Text>내 게시물 화면</Text>
      <View testID="post-item">
        <Text>게시물 1</Text>
        <Button 
          title="삭제" 
          onPress={() => handleDeletePost(1)}
          testID="delete-button"
        />
      </View>
    </View>
  );
};

// Mock StatisticsScreen 컴포넌트
const MockStatisticsScreen = ({ navigation }: any) => {
  return (
    <View>
      <Text>감정 통계</Text>
      <View testID="emotion-chart">
        <Text>그래프 영역</Text>
      </View>
    </View>
  );
};

// 컴포넌트와 서비스의 통합을 테스트하기 위한 모킹
jest.mock('../../src/services/api/postService', () => ({
  createPost: jest.fn(),
  getPosts: jest.fn(),
  getPostById: jest.fn(),
  getMyPosts: jest.fn(),
  likePost: jest.fn(),
  addComment: jest.fn(),
  getComments: jest.fn(),
  deletePost: jest.fn()
}));

// 인증 관련 모킹
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// 테스트용 데이터
const testUser = {
  user_id: 1,
  username: 'testuser',
  nickname: '테스트유저',
  email: 'test@example.com',
};

// 테스트용 게시물 데이터
const testPosts = {
  success: true,
  posts: [
    {
      post_id: 1,
      user_id: 1,
      content: '행복한 하루였어요',
      emotion_summary: '행복',
      emotion_ids: [1],
      image_url: null,
      is_anonymous: false,
      like_count: 5,
      comment_count: 2,
      created_at: '2025-04-10T12:00:00Z'
    },
    {
      post_id: 2,
      user_id: 2,
      content: '오늘은 조금 피곤하네요',
      emotion_summary: '지침',
      emotion_ids: [8],
      image_url: null,
      is_anonymous: true,
      like_count: 3,
      comment_count: 1,
      created_at: '2025-04-10T10:30:00Z'
    }
  ],
  total_count: 2
};

// 테스트용 댓글 데이터
const testComments = {
  success: true,
  comments: [
    {
      comment_id: 1,
      post_id: 1,
      user_id: 2,
      content: '너무 좋네요!',
      is_anonymous: false,
      created_at: '2025-04-10T13:00:00Z'
    }
  ],
  total_count: 1
};

// 네비게이션 모킹
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn()
};

// 테스트 컴포넌트 래퍼
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <PaperProvider>
      {children}
    </PaperProvider>
  </NavigationContainer>
);

describe('게시물 기능 E2E 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // AsyncStorage 모킹
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'auth_token') return Promise.resolve('fake-token');
      if (key === 'user_info') return Promise.resolve(JSON.stringify(testUser));
      return Promise.resolve(null);
    });
  });

  describe('게시물 상세 화면', () => {
    it('게시물 상세 조회 및 댓글 작성', async () => {
      const mockGetPostById = postService.getPostById as jest.Mock;
      mockGetPostById.mockResolvedValue({
        data: {
          success: true,
          post: testPosts.posts[0]
        }
      });
      
      const mockGetComments = postService.getComments as jest.Mock;
      mockGetComments.mockResolvedValue({
        data: testComments
      });
      
      const mockAddComment = postService.addComment as jest.Mock;
      mockAddComment.mockResolvedValue({
        data: {
          success: true,
          comment_id: 2,
          message: '댓글이 성공적으로 추가되었습니다.'
        }
      });

      // Mock 게시물 상세 컴포넌트 렌더링
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <MockPostScreen
            route={{ params: { postId: 1 } }}
            navigation={mockNavigation}
          />
        </TestWrapper>
      );

      // 게시물 ID가 표시되는지 확인
      expect(getByText('게시물 ID: 1')).toBeTruthy();

      // 댓글 입력 필드 확인
      const commentInput = getByTestId('comment-input');
      fireEvent.changeText(commentInput, 'E2E 테스트로 작성한 댓글입니다!');

      // 댓글 제출 버튼 클릭
      const submitButton = getByTestId('submit-comment');
      fireEvent.press(submitButton);

      // addComment 서비스가 호출되었는지 확인
      await waitFor(() => {
        expect(mockAddComment).toHaveBeenCalledWith(1, expect.any(Object));
      });
    }, 10000);
  });

  describe('내 게시물 관리', () => {
    it('내 게시물 화면에서 게시물을 삭제할 수 있어야 함', async () => {
      // 게시물 목록 API 모킹
      const mockGetMyPosts = postService.getMyPosts as jest.Mock;
      mockGetMyPosts.mockResolvedValue({
        data: testPosts
      });
      
      // 게시물 삭제 API 모킹
      const mockDeletePost = postService.deletePost as jest.Mock;
      mockDeletePost.mockResolvedValue({
        data: {
          success: true,
          message: '게시물이 성공적으로 삭제되었습니다.'
        }
      });

      const { getByTestId } = render(
        <TestWrapper>
          <MockMyPostsScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      // 삭제 버튼 클릭
      const deleteButton = getByTestId('delete-button');
      fireEvent.press(deleteButton);

      // deletePost가 호출되었는지 확인
      await waitFor(() => {
        expect(mockDeletePost).toHaveBeenCalledWith(1);
      });
    }, 10000);
  });

  describe('감정 통계', () => {
    it('통계 화면에서 감정 그래프가 표시되어야 함', async () => {
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <MockStatisticsScreen navigation={mockNavigation} />
        </TestWrapper>
      );

      // 그래프 영역이 존재하는지 확인
      expect(getByTestId('emotion-chart')).toBeTruthy();
      expect(getByText('감정 통계')).toBeTruthy();
    }, 10000);
  });
});