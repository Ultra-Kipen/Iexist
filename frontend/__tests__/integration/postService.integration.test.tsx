// __tests__/integration/postService.integration.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import postService from '../../src/services/api/postService';
import { MockPostScreen } from '../mocks/MockScreens';

// App 컴포넌트 직접 import 제거

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

// 인증 컨텍스트 모킹
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ 
    isAuthenticated: true, 
    isLoading: false,
    user: { user_id: 1, username: 'testuser' }
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

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

describe('게시물 기능 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mock 컴포넌트 테스트', () => {
    it('게시물 상세 조회 및 댓글 작성', async () => {
      const mockGetPostById = postService.getPostById as jest.Mock;
      mockGetPostById.mockResolvedValue({
        data: {
          success: true,
          post: {
            post_id: 1,
            content: '테스트 게시물',
            emotion_summary: '행복',
            like_count: 5,
            comment_count: 2,
            created_at: '2025-04-10T12:00:00Z'
          }
        }
      });

      const mockGetComments = postService.getComments as jest.Mock;
      mockGetComments.mockResolvedValue({
        data: {
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
        }
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
      fireEvent.changeText(commentInput, '테스트 댓글입니다.');

      // 댓글 제출 버튼 클릭
      const submitButton = getByTestId('submit-comment');
      fireEvent.press(submitButton);

      // addComment 서비스가 호출되었는지 확인
      await waitFor(() => {
        expect(mockAddComment).toHaveBeenCalledWith(1, {
          content: '테스트 댓글입니다.',
          is_anonymous: false
        });
      });

      // getPostById와 getComments가 호출되었는지 확인
      expect(mockGetPostById).toHaveBeenCalledWith(1);
      expect(mockGetComments).toHaveBeenCalledWith(1);
    });
  });
});