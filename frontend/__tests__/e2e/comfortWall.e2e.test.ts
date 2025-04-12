// __tests__/e2e/comfortWall.e2e.test.ts
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ComfortScreen from '../../src/screens/ComfortScreen';
import comfortWallService from '../../src/services/api/comfortWallService';
import { Alert } from 'react-native';
import postService from '../../src/services/api/postService';

// 원래 console.error 저장
const originalConsoleError = console.error;

// console.error 모킹 (API 오류 테스트에서 오류 로그 무시)
console.error = jest.fn((...args) => {
  // API Error 관련 로그는 무시
  if (args[0] && typeof args[0] === 'string' && args[0].includes('게시물 로드 오류')) {
    return;
  }
  originalConsoleError(...args);
});

// Navigation 관련 모킹
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

// comfortWallService 모킹
jest.mock('../../src/services/api/comfortWallService', () => ({
  getPosts: jest.fn(),
  getBestPosts: jest.fn(),
  createPost: jest.fn(),
  sendMessage: jest.fn(),
}));
// postService 모킹 추가 (다른 모킹 코드 옆에 배치)
jest.mock('../../src/services/api/postService', () => ({
  likePost: jest.fn().mockResolvedValue({ data: { message: 'success' } }),
}));

// Alert 모킹
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// React Native Paper 모킹
jest.mock('react-native-paper', () => {
  const RealComponent = jest.requireActual('react-native-paper');
  
  return {
    ...RealComponent,
    useTheme: jest.fn().mockReturnValue({
      colors: {
        primary: '#6200ee',
        accent: '#03dac4',
        background: '#f6f6f6',
        surface: '#ffffff',
        error: '#B00020',
        text: '#000000',
        disabled: '#000000',
        placeholder: '#000000',
        backdrop: '#000000',
        onSurface: '#000000',
      }
    }),
  };
});

// 테스트 데이터
const mockPosts = [
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
  },
];

const mockBestPosts = [
  {
    post_id: 3,
    title: '우울증을 극복한 경험',
    content: '저는 작년에 심한 우울증을 겪었지만...',
    like_count: 50,
    comment_count: 20,
  },
];

// ComfortScreen 컴포넌트를 렌더링하는 함수
const renderComfortScreen = () => {
  return render(React.createElement(ComfortScreen));
};

describe('ComfortScreen E2E Tests', () => {
  beforeEach(() => {
    // 모든 모킹 초기화
    jest.clearAllMocks();
    
    // 기본 응답 설정
    (comfortWallService.getPosts as jest.Mock).mockResolvedValue({
      data: { data: mockPosts },
    });
    
    (comfortWallService.getBestPosts as jest.Mock).mockResolvedValue({
      data: { data: mockBestPosts },
    });
    
    (comfortWallService.createPost as jest.Mock).mockResolvedValue({
      data: { message: '게시물이 성공적으로 등록되었습니다.' },
    });
    
    (comfortWallService.sendMessage as jest.Mock).mockResolvedValue({
      data: { message: '메시지가 성공적으로 전송되었습니다.' },
    });
  });

  test('should render loading state initially', async () => {
    const { getByTestId, queryByTestId } = renderComfortScreen();
    
    // 로딩 인디케이터가 보이는지 확인
    expect(getByTestId('loading-indicator')).toBeTruthy();
    
    // 메인 콘텐츠가 아직 보이지 않는지 확인
    expect(queryByTestId('comfort-screen-scrollview')).toBeNull();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(comfortWallService.getPosts).toHaveBeenCalledTimes(1);
      expect(comfortWallService.getBestPosts).toHaveBeenCalledTimes(1);
    });
  });

  test('should display posts and best posts when loaded', async () => {
    const { getByTestId, getByText, queryByTestId } = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 베스트 게시물 섹션이 렌더링 되었는지 확인
    expect(getByTestId('best-posts-title')).toBeTruthy();
    expect(getByText('우울증을 극복한 경험')).toBeTruthy();
    
    // 게시물 목록이 렌더링 되었는지 확인
    expect(getByTestId('posts-list')).toBeTruthy();
    expect(getByText('오늘 너무 힘들어요')).toBeTruthy();
    expect(getByText('대인관계가 어려워요')).toBeTruthy();
  });

  test('should open new post modal when FAB button is pressed', async () => {
    const { getByTestId, getByText } = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // FAB 버튼 클릭
    fireEvent.press(getByTestId('new-post-button'));
    
    // 모달이 열렸는지 확인
    expect(getByText('고민 나누기')).toBeTruthy();
    expect(getByTestId('post-title-input')).toBeTruthy();
    expect(getByTestId('post-content-input')).toBeTruthy();
    expect(getByTestId('anonymous-checkbox')).toBeTruthy();
  });

  test('should create a new post successfully', async () => {
    const { getByTestId, getByText } = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 새 게시물 모달 열기
    fireEvent.press(getByTestId('new-post-button'));
    
    // 폼 입력
    fireEvent.changeText(getByTestId('post-title-input'), '새로운 고민');
    fireEvent.changeText(getByTestId('post-content-input'), '이것은 테스트 고민입니다.');
    
    // 폼 제출
    fireEvent.press(getByTestId('submit-post-button'));
    
    // API가 올바른 데이터로 호출되었는지 확인
    await waitFor(() => {
      expect(comfortWallService.createPost).toHaveBeenCalledWith({
        title: '새로운 고민',
        content: '이것은 테스트 고민입니다.',
        is_anonymous: true
      });
    });
    
    // 성공 알림이 표시되었는지 확인
    expect(Alert.alert).toHaveBeenCalledWith(
      '성공',
      '게시물이 등록되었습니다.',
      expect.anything()
    );
  });

  test('should not submit post with empty fields', async () => {
    const { getByTestId } = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 새 게시물 모달 열기
    fireEvent.press(getByTestId('new-post-button'));
    
    // 폼 입력 없이 제출
    fireEvent.press(getByTestId('submit-post-button'));
    
    // 유효성 검사 알림이 표시되었는지 확인
    expect(Alert.alert).toHaveBeenCalledWith('알림', '제목과 내용을 모두 입력해주세요.');
    
    // API가 호출되지 않았는지 확인
    expect(comfortWallService.createPost).not.toHaveBeenCalled();
  });

  test('should open comment modal when clicking on a post', async () => {
    const { getByTestId, getByText, getAllByText } = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 첫 번째 게시물의 댓글 버튼 클릭
    fireEvent.press(getByTestId('comment-button-1'));
    
    // 댓글 모달이 열렸는지 확인
    expect(getByText('응원 메시지 보내기')).toBeTruthy();
    
    // 모달 내부에 제목이 표시되어 있는지 확인 (여러 개가 있을 수 있으므로 getAllByText 사용)
    const titleElements = getAllByText('오늘 너무 힘들어요');
    expect(titleElements.length).toBeGreaterThan(0);
    
    expect(getByTestId('comment-input')).toBeTruthy();
  });

  test('should send a comment successfully', async () => {
    const { getByTestId, getByText } = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 첫 번째 게시물의 댓글 버튼 클릭
    fireEvent.press(getByTestId('comment-button-1'));
    
    // 댓글 입력
    fireEvent.changeText(getByTestId('comment-input'), '힘내세요! 응원합니다.');
    
    // 댓글 제출
    fireEvent.press(getByTestId('submit-comment-button'));
    
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
    expect(Alert.alert).toHaveBeenCalledWith(
      '성공', 
      '메시지가 전송되었습니다.',
      expect.anything()
    );
  });

  test('should not submit empty comment', async () => {
    const { getByTestId } = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 첫 번째 게시물의 댓글 버튼 클릭
    fireEvent.press(getByTestId('comment-button-1'));
    
    // 댓글 입력 없이 제출
    fireEvent.press(getByTestId('submit-comment-button'));
    
    // 유효성 검사 알림이 표시되었는지 확인
    expect(Alert.alert).toHaveBeenCalledWith('알림', '메시지 내용을 입력해주세요.');
    
    // API가 호출되지 않았는지 확인
    expect(comfortWallService.sendMessage).not.toHaveBeenCalled();
  });

  test('should handle API error when loading posts', async () => {
    // 콘솔 에러 로깅 임시 비활성화 (테스트에서는 에러 발생이 예상됨)
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // API 오류 시뮬레이션
    (comfortWallService.getPosts as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    renderComfortScreen();
    
    // 오류 알림이 표시되었는지 확인
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('오류', '게시물을 불러오는 중 오류가 발생했습니다.');
    });
    
    // 콘솔 에러 로깅 복원
    (console.error as jest.Mock).mockRestore();
  });

  test('should handle API error when creating post', async () => {
    // API 오류 시뮬레이션
    (comfortWallService.createPost as jest.Mock).mockRejectedValue({
      response: { data: { message: '서버 오류가 발생했습니다.' } }
    });
    
    const { getByTestId } = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 새 게시물 모달 열기
    fireEvent.press(getByTestId('new-post-button'));
    
    // 폼 입력
    fireEvent.changeText(getByTestId('post-title-input'), '새로운 고민');
    fireEvent.changeText(getByTestId('post-content-input'), '이것은 테스트 고민입니다.');
    
    // 폼 제출
    fireEvent.press(getByTestId('submit-post-button'));
    
    // 오류 알림이 표시되었는지 확인
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '오류',
        '서버 오류가 발생했습니다.'
      );
    });
  });

  test('should toggle anonymous checkbox', async () => {
    const { getByTestId } = renderComfortScreen();
    
    // 로딩이 완료될 때까지 대기
    await waitFor(() => {
      expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
    });
    
    // 새 게시물 모달 열기
    fireEvent.press(getByTestId('new-post-button'));
    
    // 체크박스 토글 (익명 체크박스를 클릭하면 상태가 변경됨)
    const checkbox = getByTestId('anonymous-checkbox');
    const initialState = checkbox.props.children !== null; // 초기 상태 저장
    
    // 체크박스 클릭
    fireEvent.press(checkbox);
    
    // 폼 입력
    fireEvent.changeText(getByTestId('post-title-input'), '새로운 고민');
    fireEvent.changeText(getByTestId('post-content-input'), '이것은 테스트 고민입니다.');
    
    // 폼 제출
    fireEvent.press(getByTestId('submit-post-button'));
    
    // API가 is_anonymous: !initialState로 호출되었는지 확인
    // 초기 상태의 반대값으로 설정되었는지 확인
    await waitFor(() => {
      expect(comfortWallService.createPost).toHaveBeenCalledWith({
        title: '새로운 고민',
        content: '이것은 테스트 고민입니다.',
        is_anonymous: !initialState
      });
    });
  });


// 모달 취소 버튼 테스트 (수정)
// 모달이 열리고 닫히는 동작 테스트 (다시 수정)
test('should handle modal open and close properly', async () => {
  const { getByTestId, getByText, queryByText } = renderComfortScreen();
  
  // 로딩이 완료될 때까지 대기
  await waitFor(() => {
    expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
  });
  
  // 시작 상태에서는 모달이 닫혀 있어야 함
  expect(queryByText('고민 나누기')).toBeNull();
  
  // 새 게시물 모달 열기
  fireEvent.press(getByTestId('new-post-button'));
  
  // 모달이 열렸는지 확인
  expect(getByText('고민 나누기')).toBeTruthy();
  
  // 취소 버튼으로 모달 닫기
  fireEvent.press(getByTestId('cancel-post-button'));
  
  // 모달이 닫혔는지 확인 (비동기 처리 기다림)
  await waitFor(() => {
    expect(queryByText('고민 나누기')).toBeNull();
  }, { timeout: 3000 });
  
  // 다시 모달 열기
  fireEvent.press(getByTestId('new-post-button'));
  
  // 모달이 다시 열렸는지 확인
  await waitFor(() => {
    expect(getByText('고민 나누기')).toBeTruthy();
  });
  
  // 게시하기 버튼 동작 확인 (제목과 내용 입력 후)
  fireEvent.changeText(getByTestId('post-title-input'), '테스트 제목');
  fireEvent.changeText(getByTestId('post-content-input'), '테스트 내용');
  
  // 게시하기 전 상태 확인
  expect(getByTestId('submit-post-button')).toBeTruthy();
  
  // 게시하기 버튼 클릭
  fireEvent.press(getByTestId('submit-post-button'));
  
  // 성공 알림이 표시되었는지 확인
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith(
      '성공',
      '게시물이 등록되었습니다.',
      expect.anything()
    );
  });
});

test('should like a post', async () => {
  const { getByTestId } = renderComfortScreen();
  
  // 로딩이 완료될 때까지 대기
  await waitFor(() => {
    expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
  });
  
  // 첫 번째 게시물의 좋아요 버튼 찾기
  const likeButton = getByTestId('like-button-1');
  
  // 좋아요 버튼 클릭
  fireEvent.press(likeButton);
  
  // likePost API가 호출되었는지 확인
  await waitFor(() => {
    expect(postService.likePost).toHaveBeenCalledWith(1);
  });
  
  // 게시물 목록이 새로고침 되었는지 확인
  expect(comfortWallService.getPosts).toHaveBeenCalled();
});
  // 좋아요 취소(토글) 테스트
test('should toggle like status for a post', async () => {
  // postService.likePost 응답을 두 번째 호출에 맞게 설정
  (postService.likePost as jest.Mock)
    .mockResolvedValueOnce({ data: { message: 'liked' } })
    .mockResolvedValueOnce({ data: { message: 'unliked' } });
  
  const { getByTestId, getAllByTestId } = renderComfortScreen();
  
  // 로딩이 완료될 때까지 대기
  await waitFor(() => {
    expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
  });
  
  // 첫 번째 게시물의 좋아요 버튼 찾기
  const likeButton = getByTestId('like-button-1');
  
  // 좋아요 버튼 클릭 (좋아요)
  fireEvent.press(likeButton);
  
  // API가 호출되었는지 확인
  await waitFor(() => {
    expect(postService.likePost).toHaveBeenCalledWith(1);
  });
  
  // 좋아요 버튼을 다시 클릭 (좋아요 취소)
  fireEvent.press(likeButton);
  
  // API가 두 번 호출되었는지 확인
  await waitFor(() => {
    expect(postService.likePost).toHaveBeenCalledTimes(2);
  });
  
  // 게시물 목록이 새로고침 되었는지 확인
  expect(comfortWallService.getPosts).toHaveBeenCalledTimes(3); // 초기 로드 + 두 번의 좋아요 토글 후 새로고침
});

// 메시지 모달에서 익명 체크박스 토글 테스트
test('should toggle anonymous checkbox in message modal', async () => {
  const { getByTestId, getAllByTestId } = renderComfortScreen();
  
  // 로딩이 완료될 때까지 대기
  await waitFor(() => {
    expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
  });
  
  // 첫 번째 게시물의 댓글 버튼 클릭
  fireEvent.press(getByTestId('comment-button-1'));
  
  // 모달 내의 익명 체크박스 찾기
  const checkbox = getByTestId('anonymous-checkbox');
  const initialState = checkbox.props.children !== null; // 초기 상태 저장
  
  // 체크박스 클릭
  fireEvent.press(checkbox);
  
  // 댓글 입력
  fireEvent.changeText(getByTestId('comment-input'), '응원 메시지입니다.');
  
  // 댓글 제출
  fireEvent.press(getByTestId('submit-comment-button'));
  
  // API가 is_anonymous: !initialState로 호출되었는지 확인
  await waitFor(() => {
    expect(comfortWallService.sendMessage).toHaveBeenCalledWith(
      1, // post_id
      {
        message: '응원 메시지입니다.',
        is_anonymous: !initialState
      }
    );
  });
});

// 게시물과 메시지 모달 동시에 열기/닫기 테스트
test('should handle multiple modals correctly', async () => {
  const { getByTestId, getByText, queryByText } = renderComfortScreen();
  
  // 로딩이 완료될 때까지 대기
  await waitFor(() => {
    expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
  });
  
  // 새 게시물 모달 열기
  fireEvent.press(getByTestId('new-post-button'));
  
  // 새 게시물 모달이 열렸는지 확인
  expect(getByText('고민 나누기')).toBeTruthy();
  
  // 모달 닫기
  fireEvent.press(getByTestId('cancel-post-button'));
  
  // 모달이 닫혔는지 확인
  await waitFor(() => {
    expect(queryByText('고민 나누기')).toBeNull();
  });
  
  // 댓글 모달 열기
  fireEvent.press(getByTestId('comment-button-1'));
  
  // 댓글 모달이 열렸는지 확인
  expect(getByText('응원 메시지 보내기')).toBeTruthy();
  
  // 댓글 모달 닫기
  fireEvent.press(getByTestId('cancel-message-button'));
  
  // 댓글 모달이 닫혔는지 확인
  await waitFor(() => {
    expect(queryByText('응원 메시지 보내기')).toBeNull();
  });
});


// 좋아요 토글 테스트
test('should toggle like status when pressing like button multiple times', async () => {
  // postService.likePost 응답 설정
  (postService.likePost as jest.Mock).mockResolvedValue({ data: { message: 'success' } });
  
  const { getByTestId } = renderComfortScreen();
  
  // 로딩이 완료될 때까지 대기
  await waitFor(() => {
    expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
  });
  
  // 첫 번째 게시물의 좋아요 버튼 찾기
  const likeButton = getByTestId('like-button-1');
  
  // 좋아요 버튼 클릭 (좋아요)
  fireEvent.press(likeButton);
  
  // API가 호출되었는지 확인
  await waitFor(() => {
    expect(postService.likePost).toHaveBeenCalledWith(1);
  });
  
  // 좋아요 버튼을 다시 클릭 (좋아요 취소)
  fireEvent.press(likeButton);
  
  // API가 두 번 호출되었는지 확인
  await waitFor(() => {
    expect(postService.likePost).toHaveBeenCalledTimes(2);
  });
});

// 메시지 모달에서 익명 체크박스 토글 테스트
test('should toggle anonymous checkbox in message modal', async () => {
  const { getByTestId, getAllByTestId } = renderComfortScreen();
  
  // 로딩이 완료될 때까지 대기
  await waitFor(() => {
    expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
  });
  
  // 첫 번째 게시물의 댓글 버튼 클릭
  fireEvent.press(getByTestId('comment-button-1'));
  
  // 모달 내의 익명 체크박스 찾기
  const checkbox = getByTestId('anonymous-checkbox');
  const initialState = checkbox.props.children !== null; // 초기 상태 저장
  
  // 체크박스 클릭
  fireEvent.press(checkbox);
  
  // 댓글 입력
  fireEvent.changeText(getByTestId('comment-input'), '응원 메시지입니다.');
  
  // 댓글 제출
  fireEvent.press(getByTestId('submit-comment-button'));
  
  // API가 is_anonymous: !initialState로 호출되었는지 확인
  await waitFor(() => {
    expect(comfortWallService.sendMessage).toHaveBeenCalledWith(
      1, // post_id
      {
        message: '응원 메시지입니다.',
        is_anonymous: !initialState
      }
    );
  });
});

// API 오류 시 폼 상태 유지 테스트
test('should preserve form input when API error occurs', async () => {
  // API 오류 시뮬레이션
  (comfortWallService.createPost as jest.Mock).mockRejectedValueOnce({
    response: { data: { message: '서버 오류가 발생했습니다.' } }
  });
  
  const { getByTestId, getByText } = renderComfortScreen();
  
  // 로딩이 완료될 때까지 대기
  await waitFor(() => {
    expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
  });
  
  // 새 게시물 모달 열기
  fireEvent.press(getByTestId('new-post-button'));
  
  // 폼 입력
  const testTitle = '테스트 제목';
  const testContent = '테스트 내용입니다.';
  
  fireEvent.changeText(getByTestId('post-title-input'), testTitle);
  fireEvent.changeText(getByTestId('post-content-input'), testContent);
  
  // 폼 제출
  fireEvent.press(getByTestId('submit-post-button'));
  
  // 오류 발생 후에도 폼 입력이 유지되는지 확인
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('오류', '서버 오류가 발생했습니다.');
    
    // 제목과 내용이 유지되어야 함
    const titleInput = getByTestId('post-title-input');
    const contentInput = getByTestId('post-content-input');
    
    expect(titleInput.props.value).toBe(testTitle);
    expect(contentInput.props.value).toBe(testContent);
  });
});


// API 오류 시 폼 상태 유지 테스트
test('should preserve form input when API error occurs', async () => {
  // API 오류 시뮬레이션
  (comfortWallService.createPost as jest.Mock).mockRejectedValueOnce({
    response: { data: { message: '서버 오류가 발생했습니다.' } }
  });
  
  const { getByTestId, getByText } = renderComfortScreen();
  
  // 로딩이 완료될 때까지 대기
  await waitFor(() => {
    expect(getByTestId('comfort-screen-scrollview')).toBeTruthy();
  });
  
  // 새 게시물 모달 열기
  fireEvent.press(getByTestId('new-post-button'));
  
  // 폼 입력
  const testTitle = '테스트 제목';
  const testContent = '테스트 내용입니다.';
  
  fireEvent.changeText(getByTestId('post-title-input'), testTitle);
  fireEvent.changeText(getByTestId('post-content-input'), testContent);
  
  // 폼 제출
  fireEvent.press(getByTestId('submit-post-button'));
  
  // 오류 발생 후에도 폼 입력이 유지되는지 확인
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('오류', '서버 오류가 발생했습니다.');
    
    // 제목과 내용이 유지되어야 함
    const titleInput = getByTestId('post-title-input');
    const contentInput = getByTestId('post-content-input');
    
    expect(titleInput.props.value).toBe(testTitle);
    expect(contentInput.props.value).toBe(testContent);
  });
});
});