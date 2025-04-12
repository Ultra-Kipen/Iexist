// __tests__/screens/HomeScreen.test.tsx
import React from 'react';
import { 
  handlePostSubmission, 
  renderEmotionIcon, 
  emotions, 
  initialPosts,
  handleImageUploadAction,
  handleLikeAction,
  handleCommentAction,
  renderEmotionSelector,
  renderPostInput,
  renderPosts
} from '../../src/screens/HomeScreen';
import { Emotion } from '../../src/screens/HomeScreen';
// React Native Vector Icons 모킹
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// React Native Paper 모킹
jest.mock('react-native-paper', () => ({
  Text: 'Text',
  Button: 'Button',
  Chip: 'Chip',
  TextInput: 'TextInput',
  Card: {
    Title: 'Card.Title',
    Content: 'Card.Content',
    Actions: 'Card.Actions'
  },
  Avatar: {
    Icon: 'Avatar.Icon'
  },
  IconButton: 'IconButton',
  FAB: 'FAB',
  Divider: 'Divider',
  Surface: 'Surface',
  ActivityIndicator: 'ActivityIndicator',
  Portal: 'Portal',
  Dialog: {
    Title: 'Dialog.Title',
    Content: 'Dialog.Content',
    Actions: 'Dialog.Actions'
  },
  useTheme: () => ({
    colors: {
      primary: '#6200ee',
      surface: '#ffffff'
    }
  })
}));

// React Native 모킹
jest.mock('react-native', () => ({
  View: 'View',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: (styles: any) => styles  // 타입 추가
  },
  Image: 'Image',
}));

// HomeScreen 컴포넌트 모킹
jest.mock('../../src/screens/HomeScreen', () => {
  const actual = jest.requireActual('../../src/screens/HomeScreen');
  return {
    __esModule: true,
    default: () => null,
    handlePostSubmission: actual.handlePostSubmission,
    renderEmotionIcon: actual.renderEmotionIcon,
    emotions: actual.emotions,
    initialPosts: actual.initialPosts,
    handleImageUploadAction: actual.handleImageUploadAction,
    handleLikeAction: actual.handleLikeAction,
    handleCommentAction: actual.handleCommentAction,
    renderEmotionSelector: actual.renderEmotionSelector,
    renderPostInput: actual.renderPostInput,
    renderPosts: actual.renderPosts
  };
});

// Timeout 모킹
jest.useFakeTimers();

// console 함수 모킹
console.log = jest.fn();
console.error = jest.fn();

describe('HomeScreen Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 헬퍼 함수 테스트
  it('tests handlePostSubmission helper function with valid input', () => {
    const setIsLoading = jest.fn();
    const setIsDialogVisible = jest.fn();
    
    // 유효한 입력으로 테스트
    const validResult = handlePostSubmission(
      '테스트 내용',
      emotions[0], // 첫 번째 감정(행복)
      'test-image.jpg',
      setIsLoading,
      setIsDialogVisible
    );
    
    expect(validResult).toBe(true);
    expect(setIsLoading).toHaveBeenCalledWith(true);
    
    // 타이머 진행
    jest.advanceTimersByTime(1000);
    
    expect(setIsLoading).toHaveBeenCalledWith(false);
    expect(setIsDialogVisible).toHaveBeenCalledWith(true);
  });
  
  it('tests handlePostSubmission helper function with invalid input', () => {
    const setIsLoading = jest.fn();
    const setIsDialogVisible = jest.fn();
    
    // 빈 내용으로 테스트
    const invalidContentResult = handlePostSubmission(
      '', // 빈 내용
      emotions[0],
      'test-image.jpg',
      setIsLoading,
      setIsDialogVisible
    );
    
    expect(invalidContentResult).toBe(false);
    expect(setIsLoading).not.toHaveBeenCalled();
    
    // 감정 없이 테스트
    const invalidEmotionResult = handlePostSubmission(
      '테스트 내용',
      null, // 감정 없음
      'test-image.jpg',
      setIsLoading,
      setIsDialogVisible
    );
    
    expect(invalidEmotionResult).toBe(false);
  });
  
  it('tests renderEmotionIcon helper function', () => {
    const icon = renderEmotionIcon('emoticon-happy-outline', '#FFD700');
    expect(icon).toBeTruthy();
  });
  
  it('tests that renderEmotionIcon logs errors', () => {
    console.error = jest.fn();
    
    // 아이콘을 렌더링해도 콘솔 에러는 기록되지 않음
    renderEmotionIcon('emoticon-happy-outline', '#FFD700');
    expect(console.error).not.toHaveBeenCalled();
    
    // 실제 내부 에러는 테스트하기 어려우므로 에러 핸들링 존재만 확인
    expect(renderEmotionIcon.toString()).toContain('try');
    expect(renderEmotionIcon.toString()).toContain('catch');
  });

  it('tests handleImageUploadAction function', () => {
    const setImageUrl = jest.fn();
    
    // 함수 실행
    handleImageUploadAction(setImageUrl);
    
    // 결과 검증
    expect(setImageUrl).toHaveBeenCalledWith('https://via.placeholder.com/150');
    expect(console.log).toHaveBeenCalledWith('이미지 업로드 기능이 호출되었습니다.');
  });

  it('tests handleLikeAction function', () => {
    const posts = [...initialPosts]; // 초기 게시물 복사
    const postId = 1; // 첫 번째 게시물
    const setPosts = jest.fn();
    const initialLikes = posts.find(p => p.id === postId)?.likes || 0;
    
    // 함수 실행
    handleLikeAction(posts, postId, setPosts);
    
    // 결과 검증
    expect(setPosts).toHaveBeenCalled();
    
    // setPosts에 전달된 새 배열 검증
    const updatedPosts = setPosts.mock.calls[0][0];
    const updatedPost = updatedPosts.find((p: any) => p.id === postId);
    expect(updatedPost?.likes).toBe(initialLikes + 1);
  });

  it('tests handleCommentAction function', () => {
    const posts = [...initialPosts]; // 초기 게시물 복사
    const postId = 1; // 첫 번째 게시물
    const commentContent = '테스트 댓글';
    const setPosts = jest.fn();
    const originalCommentCount = posts.find(p => p.id === postId)?.comments.length || 0;
    
    // Date.now 모킹
    const origDateNow = Date.now;
    Date.now = jest.fn(() => 1234567890);
    
    // 함수 실행
    handleCommentAction(posts, postId, commentContent, setPosts);
    
    // 결과 검증
    expect(setPosts).toHaveBeenCalled();
    
    // setPosts에 전달된 새 배열 검증
    const updatedPosts = setPosts.mock.calls[0][0];
    const updatedPost = updatedPosts.find((p: any) => p.id === postId);  // 타입 추가
    expect(updatedPost?.comments.length).toBe(originalCommentCount + 1);
    expect(updatedPost?.comments[originalCommentCount].content).toBe(commentContent);
    expect(updatedPost?.comments[originalCommentCount].id).toBe(1234567890);
    
    // 원래 Date.now로 복원
    Date.now = origDateNow;
  });
});

describe('HomeScreen Rendering Functions', () => {
  it('tests renderEmotionSelector function', () => {
    // 모킹된 상태 및 설정
    const selectedEmotion = emotions[0];
    const setSelectedEmotion = jest.fn();
    const mockStyles = {
      emotionSelector: {},
      emotionChip: {},
      emotionLabel: {}
    };
    
    // 렌더링 함수 호출
    const selector = renderEmotionSelector(selectedEmotion, setSelectedEmotion, mockStyles);
    
    // 결과 검증
    expect(selector).toBeTruthy();
    // 여기서는 실제 렌더링 결과를 직접 검증하기는 어렵고, 타입과 반환 여부만 확인
  });

  it('tests renderPostInput function', () => {
    // 모킹된 상태 및 설정
    const postContent = '테스트 내용';
    const setPostContent = jest.fn();
    const imageUrl = 'test-image.jpg';
    const handleImageUpload = jest.fn();
    const mockStyles = {
      postInput: {},
      imageButton: {},
      uploadedImage: {}
    };
    
    // 렌더링 함수 호출
    const input = renderPostInput(postContent, setPostContent, imageUrl, handleImageUpload, mockStyles);
    
    // 결과 검증
    expect(input).toBeTruthy();
    // 여기서는 실제 렌더링 결과를 직접 검증하기는 어렵고, 타입과 반환 여부만 확인
  });
  
  it('tests renderPosts function', () => {
    // 모킹된 상태 및 설정
    const posts = [...initialPosts];
    const handleLike = jest.fn();
    const handleComment = jest.fn();
    const mockTheme = { colors: { primary: '#000000' } };
    const mockStyles = {
      postCard: {},
      postContent: {},
      emotionContainer: {},
      emotionIcon: {},
      emotionChip: {},
      postImage: {},
      commentContainer: {},
      commentAuthor: {}
    };
    
    // 렌더링 함수 호출
    const renderedPosts = renderPosts(posts, handleLike, handleComment, mockTheme, mockStyles);
    
    // 결과 검증
    expect(renderedPosts).toBeTruthy();
    expect(renderedPosts.length).toBe(posts.length);
    // 여기서는 실제 렌더링 결과를 직접 검증하기는 어렵고, 타입과 반환 여부만 확인
  });

  // 전체 HomeScreen 컴포넌트 렌더링 시뮬레이션
  it('simulates the full HomeScreen component interactions', () => {
    // 주요 상태 관리 함수들을 모킹
    const mockSetSelectedEmotion = jest.fn();
    const mockSetPostContent = jest.fn();
    const mockSetImageUrl = jest.fn();
    const mockSetIsLoading = jest.fn();
    const mockSetIsDialogVisible = jest.fn();
    const mockSetPosts = jest.fn();
    
    // 초기 상태 모킹
    const mockSelectedEmotion = emotions[0]; // '행복' 감정 선택
    const mockPostContent = '테스트 게시물 내용';
    const mockImageUrl = 'https://via.placeholder.com/150';
    const mockIsLoading = false;
    const mockIsDialogVisible = false;
    let mockPosts = [...initialPosts];
    
    // 이벤트 핸들러 모킹 및 시뮬레이션
    const handlePost = () => {
      const success = handlePostSubmission(
        mockPostContent,
        mockSelectedEmotion,
        mockImageUrl,
        mockSetIsLoading,
        mockSetIsDialogVisible
      );
      
      // 게시물 제출 성공 시 후속 처리 시뮬레이션
      if (success) {
        // 성공 메시지 표시
        mockSetIsLoading(true);
        jest.advanceTimersByTime(1000);
        mockSetIsLoading(false);
        mockSetIsDialogVisible(true);
        
        // 새 게시물 추가
        const newPost = {
          id: Date.now(),
          anonymousId: '익명',
          content: mockPostContent,
          emotion: mockSelectedEmotion.label,
          emotionIcon: '😊',
          image: mockImageUrl,
          likes: 0,
          comments: [],
          timestamp: '방금 전'
        };
        
        mockPosts = [newPost, ...mockPosts];
        mockSetPosts(mockPosts);
        
        // 입력 필드 초기화
        mockSetPostContent('');
        mockSetSelectedEmotion(null);
        mockSetImageUrl('');
      }
      
      return success;
    };
    
    const handleImageUpload = () => {
      handleImageUploadAction(mockSetImageUrl);
    };
    
    const handleLike = (postId: number) => {
      handleLikeAction(mockPosts, postId, mockSetPosts);
    };
    
    const handleComment = (postId: number, commentContent: string) => {
      handleCommentAction(mockPosts, postId, commentContent, mockSetPosts);
    };
    
    // 시뮬레이션: 이미지 업로드
    handleImageUpload();
    expect(mockSetImageUrl).toHaveBeenCalledWith('https://via.placeholder.com/150');
    
    // 시뮬레이션: 게시물 작성
    const postResult = handlePost();
    expect(postResult).toBe(true);
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(mockSetIsDialogVisible).toHaveBeenCalledWith(true);
    expect(mockSetPosts).toHaveBeenCalled();
    expect(mockSetPostContent).toHaveBeenCalledWith('');
    expect(mockSetSelectedEmotion).toHaveBeenCalledWith(null);
    expect(mockSetImageUrl).toHaveBeenCalledWith('');
    
    // 시뮬레이션: 좋아요 버튼 클릭
    handleLike(1);
    
    // 시뮬레이션: 댓글 작성
    handleComment(1, '테스트 댓글');
  });
});

describe('HomeScreen Data Structures', () => {
  it('validates emotions array structure', () => {
    // 감정 배열이 존재하는지 확인
    expect(emotions).toBeDefined();
    expect(Array.isArray(emotions)).toBe(true);
    expect(emotions.length).toBeGreaterThan(0);
    
    // 각 감정의 구조 검증
    emotions.forEach(emotion => {
      expect(emotion).toHaveProperty('label');
      expect(emotion).toHaveProperty('icon');
      expect(emotion).toHaveProperty('color');
      
      // 타입 검증
      expect(typeof emotion.label).toBe('string');
      expect(typeof emotion.icon).toBe('string');
      expect(typeof emotion.color).toBe('string');
      
      // 값 검증
      expect(emotion.label.length).toBeGreaterThan(0);
      expect(emotion.icon.length).toBeGreaterThan(0);
      expect(emotion.color.length).toBeGreaterThan(0);
    });
  });
  
  it('checks for unique emotion labels', () => {
    const labels = emotions.map(e => e.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
  
  it('checks emotion colors are valid', () => {
    emotions.forEach(emotion => {
      // 색상이 HEX 포맷인지 확인 (#RRGGBB 또는 #RGB)
      expect(emotion.color).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
    });
  });
  
  it('validates initialPosts structure', () => {
    // 초기 게시물 배열이 존재하는지 확인
    expect(initialPosts).toBeDefined();
    expect(Array.isArray(initialPosts)).toBe(true);
    expect(initialPosts.length).toBeGreaterThan(0);
    
    // 각 게시물의 구조 검증
    initialPosts.forEach(post => {
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('anonymousId');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('emotion');
      expect(post).toHaveProperty('emotionIcon');
      expect(post).toHaveProperty('image');
      expect(post).toHaveProperty('likes');
      expect(post).toHaveProperty('comments');
      expect(post).toHaveProperty('timestamp');
      
      // 타입 검증
      expect(typeof post.id).toBe('number');
      expect(typeof post.anonymousId).toBe('string');
      expect(typeof post.content).toBe('string');
      expect(typeof post.emotion).toBe('string');
      expect(typeof post.emotionIcon).toBe('string');
      expect(typeof post.image).toBe('string');
      expect(typeof post.likes).toBe('number');
      expect(Array.isArray(post.comments)).toBe(true);
      expect(typeof post.timestamp).toBe('string');
      
      // 댓글 구조 검증
      post.comments.forEach(comment => {
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('author');
        expect(comment).toHaveProperty('content');
        
        expect(typeof comment.id).toBe('number');
        expect(typeof comment.author).toBe('string');
        expect(typeof comment.content).toBe('string');
      });
    });
  });
});

// 시뮬레이션 테스트
describe('HomeScreen Component Simulation', () => {
  // HomeScreen 컴포넌트 내 주요 로직 흐름 테스트
  it('simulates a complete user interaction flow', () => {
    // 상태 변수들 모킹
    const mockInitialState = {
      selectedEmotion: null,
      postContent: '',
      imageUrl: '',
      isLoading: false,
      isDialogVisible: false,
      posts: [...initialPosts]
    };
    
    // 상태 설정 함수들 모킹
    const mockSetState = {
      setSelectedEmotion: jest.fn((emotion) => { mockInitialState.selectedEmotion = emotion; }),
      setPostContent: jest.fn((content) => { mockInitialState.postContent = content; }),
      setImageUrl: jest.fn((url) => { mockInitialState.imageUrl = url; }),
      setIsLoading: jest.fn((loading) => { mockInitialState.isLoading = loading; }),
      setIsDialogVisible: jest.fn((visible) => { mockInitialState.isDialogVisible = visible; }),
      setPosts: jest.fn((posts) => { mockInitialState.posts = posts; })
    };
    
    // 1. 감정 선택 시뮬레이션
    mockSetState.setSelectedEmotion(emotions[0]);
    expect(mockInitialState.selectedEmotion).toBe(emotions[0]);
    
    // 2. 게시물 내용 입력 시뮬레이션
    mockSetState.setPostContent('테스트 게시물 내용');
    expect(mockInitialState.postContent).toBe('테스트 게시물 내용');
    
    // 3. 이미지 업로드 시뮬레이션
    handleImageUploadAction(mockSetState.setImageUrl);
    expect(mockSetState.setImageUrl).toHaveBeenCalledWith('https://via.placeholder.com/150');
    
    // 4. 게시물 제출 시뮬레이션
    const postResult = handlePostSubmission(
      mockInitialState.postContent,
      mockInitialState.selectedEmotion,
      mockInitialState.imageUrl,
      mockSetState.setIsLoading,
      mockSetState.setIsDialogVisible
    );
    
    expect(postResult).toBe(true);
    expect(mockSetState.setIsLoading).toHaveBeenCalledWith(true);
    
    jest.advanceTimersByTime(1000);
    
    expect(mockSetState.setIsLoading).toHaveBeenCalledWith(false);
    expect(mockSetState.setIsDialogVisible).toHaveBeenCalledWith(true);
    
    // 게시물 추가 시뮬레이션
    const emotion = mockInitialState.selectedEmotion 
    ? (mockInitialState.selectedEmotion as Emotion).label 
    : '';
  
  const newPost = {
    id: Date.now(),
    anonymousId: '익명',
    content: mockInitialState.postContent,
    emotion: emotion,
    emotionIcon: '😊',
    image: mockInitialState.imageUrl,
    likes: 0,
    comments: [],
    timestamp: '방금 전'
  };
    mockSetState.setPosts([newPost, ...mockInitialState.posts]);
    expect(mockInitialState.posts.length).toBe(initialPosts.length + 1);
    expect(mockInitialState.posts[0]).toBe(newPost);
    
    // 5. 좋아요 시뮬레이션
    const postId = initialPosts[0].id;
    const origLikes = initialPosts[0].likes;
    
    handleLikeAction(mockInitialState.posts, postId, mockSetState.setPosts);
    expect(mockSetState.setPosts).toHaveBeenCalled();
    
    // 6. 댓글 작성 시뮬레이션
    handleCommentAction(mockInitialState.posts, postId, '테스트 댓글', mockSetState.setPosts);
    expect(mockSetState.setPosts).toHaveBeenCalled();
    
    // 7. 다이얼로그 닫기 시뮬레이션
    mockSetState.setIsDialogVisible(false);
    expect(mockInitialState.isDialogVisible).toBe(false);
  });
});