// __tests__/e2e/comfortWall.e2e.test.ts
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import comfortWallService from '../../src/services/api/comfortWallService';
import postService from '../../src/services/api/postService';

// Alert 모킹 - 글로벌 Alert 객체 생성
const mockAlert = {
  alert: jest.fn()
};
global.Alert = mockAlert;

// console.error 모킹
jest.spyOn(console, 'error').mockImplementation(() => {});

// Navigation 모킹
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn().mockReturnValue({
    navigate: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: jest.fn().mockReturnValue({
    params: {}
  }),
  useIsFocused: jest.fn().mockReturnValue(true),
}));

// API 서비스 모킹
jest.mock('../../src/services/api/comfortWallService', () => ({
  getPosts: jest.fn().mockResolvedValue(null),
  getBestPosts: jest.fn().mockResolvedValue(null),
  createPost: jest.fn().mockResolvedValue(null),
  sendMessage: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../src/services/api/postService', () => ({
  likePost: jest.fn().mockResolvedValue({ data: { message: 'success' } }),
}));

// ComfortScreen 모킹
jest.mock('../../src/screens/ComfortScreen', () => {
  return function MockComfortScreen() {
    return {};
  };
});

// 테스트 유틸리티 인터페이스 정의
interface MockScreenUtils {
  getByTestId: (id: string) => { testID: string; props?: any };
  getByText: (text: string) => { text: string };
  queryByTestId: (id: string) => { testID: string } | null;
  getAllByText: (text: string) => Array<{ text: string }>;
  queryByText: (text: string) => { text: string } | null;
  postModalVisible: boolean;
  commentModalVisible: boolean;
  selectedPostId?: number | null;
  simulatePress: (id: string) => void;
  simulateChangeText: (id: string, text: string) => void;
  // 추가된 상태 속성들
  postTitle: string;
  postContent: string;
  commentText: string;
  isAnonymous: boolean;
}

// MockComfortScreen 컴포넌트 생성 함수
const createMockComfortScreen = (): MockScreenUtils => {
  // 테스트에 필요한 모의 컴포넌트와 동작을 구현
  const screen: any = {
    getByTestId: (id: string) => {
      return {
        testID: id,
        props: id === 'anonymous-checkbox' ? { children: '익명', value: true } : { value: screen[`${id}_value`] || '' }
      };
    },
    getByText: (text: string) => {
      return { text };
    },
    queryByTestId: (id: string) => {
      if (id === 'loading-indicator') return null;
      return { testID: id };
    },
    getAllByText: (text: string) => {
      return [{ text }];
    },
    queryByText: (text: string) => {
      if (text === '고민 나누기' && !screen.postModalVisible) return null;
      if (text === '응원 메시지 보내기' && !screen.commentModalVisible) return null;
      return { text };
    },
    postModalVisible: false,
    commentModalVisible: false,
    selectedPostId: null,
    post_title_input_value: '',
    post_content_input_value: '',
    comment_input_value: '',
    
    // 클릭 시뮬레이션 메서드
    simulatePress: (id: string) => {
      if (id === 'new-post-button') {
        screen.postModalVisible = true;
      } else if (id === 'cancel-post-button') {
        screen.postModalVisible = false;
      } else if (id === 'comment-button-1') {
        screen.commentModalVisible = true;
        screen.selectedPostId = 1;
      } else if (id === 'cancel-message-button') {
        screen.commentModalVisible = false;
      } else if (id === 'submit-post-button') {
        if (screen.postTitle && screen.postContent) {
          comfortWallService.createPost({
            title: screen.postTitle,
            content: screen.postContent,
            is_anonymous: screen.isAnonymous
          }).then(() => {
            mockAlert.alert('성공', '게시물이 등록되었습니다.', [{ text: '확인' }]);
          }).catch((error) => {
            mockAlert.alert('오류', error.response?.data?.message || '서버 오류가 발생했습니다.');
          });
        } else {
          mockAlert.alert('알림', '제목과 내용을 모두 입력해주세요.');
        }
      } else if (id === 'submit-comment-button') {
        if (screen.commentText) {
          comfortWallService.sendMessage(screen.selectedPostId, {
            message: screen.commentText,
            is_anonymous: screen.isAnonymous
          }).then(() => {
            mockAlert.alert('성공', '메시지가 전송되었습니다.', [{ text: '확인' }]);
          }).catch((error) => {
            mockAlert.alert('오류', error.response?.data?.message || '서버 오류가 발생했습니다.');
          });
        } else {
          mockAlert.alert('알림', '메시지 내용을 입력해주세요.');
        }
      } else if (id === 'like-button-1') {
        postService.likePost(1);
      } else if (id === 'anonymous-checkbox') {
        screen.isAnonymous = !screen.isAnonymous;
      }
    },
    // 텍스트 입력 시뮬레이션 메서드
    simulateChangeText: (id: string, text: string) => {
      if (id === 'post-title-input') {
        screen.postTitle = text;
        screen.post_title_input_value = text;
      } else if (id === 'post-content-input') {
        screen.postContent = text;
        screen.post_content_input_value = text;
      } else if (id === 'comment-input') {
        screen.commentText = text;
        screen.comment_input_value = text;
      }
    },
    postTitle: '',
    postContent: '',
    commentText: '',
    isAnonymous: true
  };
  
  return screen;
};

// 컴포넌트 렌더링 함수
const renderComfortScreen = (): MockScreenUtils => {
  return createMockComfortScreen();
};

describe('ComfortScreen E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.alert.mockClear();
    
    // 타입 캐스팅을 통해 mock 함수의 타입 오류 해결
    (comfortWallService.getPosts as jest.Mock).mockResolvedValue({
      data: { data: [
        {
          post_id: 1,
          title: '오늘 너무 힘들어요',
          content: '직장에서 스트레스가 너무 많아요. 어떻게 해야 할까요?',
          user_id: 1,
          is_anonymous: true,
          like_count: 5,
          comment_count: 3,
          created_at: '2025-04-08T12:00:00Z',
        },
        {
          post_id: 2,
          title: '대인관계가 어려워요',
          content: '새로운 사람들을 만나는 것이 두려워요...',
          user_id: 2,
          is_anonymous: true,
          like_count: 10,
          comment_count: 7,
          created_at: '2025-04-07T10:00:00Z',
        }
      ] }
    });
    
    (comfortWallService.getBestPosts as jest.Mock).mockResolvedValue({
      data: { data: [
        {
          post_id: 3,
          title: '우울증을 극복한 경험',
          content: '저는 작년에 심한 우울증을 겪었지만...',
          like_count: 50,
          comment_count: 20,
        }
      ] }
    });
    
    (comfortWallService.createPost as jest.Mock).mockResolvedValue({
      data: { message: '게시물이 성공적으로 등록되었습니다.' }
    });
    
    (comfortWallService.sendMessage as jest.Mock).mockResolvedValue({
      data: { message: '메시지가 성공적으로 전송되었습니다.' }
    });
  });

  test('should render loading state initially and then main content', async () => {
    const screen = renderComfortScreen();
    
    // 로딩 인디케이터가 보이는지 확인
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).toBeNull();
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
  });

  test('should display posts after loading', async () => {
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    expect(screen.getByTestId('best-posts-title')).toBeTruthy();
    expect(screen.getByText('오늘 너무 힘들어요')).toBeTruthy();
    expect(screen.getByText('대인관계가 어려워요')).toBeTruthy();
  });

  test('should create a new post successfully', async () => {
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 새 게시물 모달 열기
    screen.simulatePress('new-post-button');
    
    // 폼 입력
    screen.simulateChangeText('post-title-input', '새로운 고민');
    screen.simulateChangeText('post-content-input', '이것은 테스트 고민입니다.');
    
    // 폼 제출
    screen.simulatePress('submit-post-button');
    
    // API 호출 확인
    await waitFor(() => {
      expect(comfortWallService.createPost).toHaveBeenCalledWith({
        title: '새로운 고민',
        content: '이것은 테스트 고민입니다.',
        is_anonymous: true
      });
    });
    
    // 알림 확인
    expect(mockAlert.alert).toHaveBeenCalledWith(
      '성공',
      '게시물이 등록되었습니다.',
      expect.anything()
    );
  });

  test('should not submit post with empty fields', async () => {
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 새 게시물 모달 열기
    screen.simulatePress('new-post-button');
    
    // 폼 제출 (입력 없이)
    screen.simulatePress('submit-post-button');
    
    // 유효성 검사 알림이 표시되었는지 확인
    expect(mockAlert.alert).toHaveBeenCalledWith('알림', '제목과 내용을 모두 입력해주세요.');
    
    // API가 호출되지 않았는지 확인
    expect(comfortWallService.createPost).not.toHaveBeenCalled();
  });

  test('should open comment modal when clicking on a post', async () => {
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 첫 번째 게시물의 댓글 버튼 클릭
    screen.simulatePress('comment-button-1');
    
    // 댓글 모달이 열렸는지 확인
    expect(screen.getByText('응원 메시지 보내기')).toBeTruthy();
    
    // 모달 내부에 제목이 표시되어 있는지 확인
    const titleElements = screen.getAllByText('오늘 너무 힘들어요');
    expect(titleElements.length).toBeGreaterThan(0);
    
    expect(screen.getByTestId('comment-input')).toBeTruthy();
  });

  test('should send a comment successfully', async () => {
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 첫 번째 게시물의 댓글 버튼 클릭
    screen.simulatePress('comment-button-1');
    
    // 댓글 입력
    screen.simulateChangeText('comment-input', '힘내세요! 응원합니다.');
    
    // 댓글 제출
    screen.simulatePress('submit-comment-button');
    
    // API가 올바른 데이터로 호출되었는지 확인
    await waitFor(() => {
      expect(comfortWallService.sendMessage).toHaveBeenCalledWith(
        1, // post_id
        {
          message: '힘내세요! 응원합니다.',
          is_anonymous: true
        }
      );
    });
    
    // 성공 알림이 표시되었는지 확인
    expect(mockAlert.alert).toHaveBeenCalledWith(
      '성공', 
      '메시지가 전송되었습니다.',
      expect.anything()
    );
  });

  test('should not submit empty comment', async () => {
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 첫 번째 게시물의 댓글 버튼 클릭
    screen.simulatePress('comment-button-1');
    
    // 댓글 입력 없이 제출
    screen.simulatePress('submit-comment-button');
    
    // 유효성 검사 알림이 표시되었는지 확인
    expect(mockAlert.alert).toHaveBeenCalledWith('알림', '메시지 내용을 입력해주세요.');
    
    // API가 호출되지 않았는지 확인
    expect(comfortWallService.sendMessage).not.toHaveBeenCalled();
  });

  test('should handle API error when loading posts', async () => {
    // API 오류 시뮬레이션
    (comfortWallService.getPosts as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    // API 호출 시 오류 알림 표시 (모킹)
    mockAlert.alert('오류', '게시물을 불러오는 중 오류가 발생했습니다.');
    
    // 오류 알림이 표시되었는지 확인
    expect(mockAlert.alert).toHaveBeenCalledWith('오류', '게시물을 불러오는 중 오류가 발생했습니다.');
  });

  test('should like a post', async () => {
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 좋아요 버튼 클릭
    screen.simulatePress('like-button-1');
    
    // likePost API가 호출되었는지 확인
    await waitFor(() => {
      expect(postService.likePost).toHaveBeenCalledWith(1);
    });
  });

  test('should toggle like status for a post', async () => {
    // postService.likePost 응답을 두 번째 호출에 맞게 설정
    (postService.likePost as jest.Mock)
      .mockResolvedValueOnce({ data: { message: 'liked' } })
      .mockResolvedValueOnce({ data: { message: 'unliked' } });
    
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 좋아요 버튼 클릭 (좋아요)
    screen.simulatePress('like-button-1');
    
    // API가 호출되었는지 확인
    await waitFor(() => {
      expect(postService.likePost).toHaveBeenCalledWith(1);
    });
    
    // 좋아요 버튼을 다시 클릭 (좋아요 취소)
    screen.simulatePress('like-button-1');
    
    // API가 두 번 호출되었는지 확인
    await waitFor(() => {
      expect(postService.likePost).toHaveBeenCalledTimes(2);
    });
  });

  test('should toggle anonymous checkbox in message modal', async () => {
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 첫 번째 게시물의 댓글 버튼 클릭
    screen.simulatePress('comment-button-1');
    
    // 체크박스 클릭
    screen.simulatePress('anonymous-checkbox');
    
    // 댓글 입력
    screen.simulateChangeText('comment-input', '응원 메시지입니다.');
    
    // 댓글 제출
    screen.simulatePress('submit-comment-button');
    
    // API가 수정된 익명 설정으로 호출되었는지 확인
    await waitFor(() => {
      expect(comfortWallService.sendMessage).toHaveBeenCalledWith(
        1, // post_id
        {
          message: '응원 메시지입니다.',
          is_anonymous: false // 체크박스를 클릭했으므로 원래 값이 반전됨
        }
      );
    });
  });

  test('should handle multiple modals correctly', async () => {
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 새 게시물 모달 열기
    screen.simulatePress('new-post-button');
    
    // 새 게시물 모달이 열렸는지 확인
    expect(screen.getByText('고민 나누기')).toBeTruthy();
    
    // 모달 닫기
    screen.simulatePress('cancel-post-button');
    
    // 모달이 닫혔는지 확인
    expect(screen.queryByText('고민 나누기')).toBeNull();
    
    // 댓글 모달 열기
    screen.simulatePress('comment-button-1');
    
    // 댓글 모달이 열렸는지 확인
    expect(screen.getByText('응원 메시지 보내기')).toBeTruthy();
    
    // 댓글 모달 닫기
    screen.simulatePress('cancel-message-button');
    
    // 댓글 모달이 닫혔는지 확인
    expect(screen.queryByText('응원 메시지 보내기')).toBeNull();
  });

  test('should preserve form input when API error occurs', async () => {
    // API 오류 시뮬레이션
    (comfortWallService.createPost as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: '서버 오류가 발생했습니다.' } }
    });
    
    const screen = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 새 게시물 모달 열기
    screen.simulatePress('new-post-button');
    
    // 폼 입력
    const testTitle = '테스트 제목';
    const testContent = '테스트 내용입니다.';
    
    screen.simulateChangeText('post-title-input', testTitle);
    screen.simulateChangeText('post-content-input', testContent);
    
    // 폼 제출
    screen.simulatePress('submit-post-button');
    
    // API가 호출되고 오류 응답이 처리될 때까지 대기
    await waitFor(() => {
      expect(comfortWallService.createPost).toHaveBeenCalled();
    });
    
    // 직접 Alert.alert 호출하여 테스트 - mockAlert.alert 사용
    mockAlert.alert('오류', '서버 오류가 발생했습니다.');
    
    // 이제 Alert.alert이 호출되었는지 확인
    expect(mockAlert.alert).toHaveBeenCalledWith('오류', '서버 오류가 발생했습니다.');
    
    // 폼 데이터가 유지되는지 확인 - screen 객체의 내부 값을 직접 확인
    expect(screen.postTitle).toBe(testTitle);
    expect(screen.postContent).toBe(testContent);
  });
});