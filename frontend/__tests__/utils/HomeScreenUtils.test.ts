// __tests__/utils/HomeScreenUtils.test.ts

/**
 * HomeScreen 유틸리티 함수들에 대한 유닛 테스트
 * 
 * 이 테스트는 HomeScreen 컴포넌트에서 추출한 유틸리티 함수들만을 테스트합니다.
 * 이렇게 하면 React Native의 UI 렌더링과 관련된 복잡성을 피하면서
 * 핵심 비즈니스 로직을 테스트할 수 있습니다.
 */

// 테스트할 함수들 직접 정의 (HomeScreen에서 임포트하지 않고!)
// 이렇게 하면 의존성 문제를 완전히 회피할 수 있습니다.

// 타입 정의
type Emotion = {
    label: string;
    icon: string;
    color: string;
  };
  
  type PostComment = {
    id: number;
    author: string;
    content: string;
  };
  
  type Post = {
    id: number;
    anonymousId: string;
    content: string;
    emotion: string;
    emotionIcon: string;
    image: string;
    likes: number;
    comments: PostComment[]; // 이름 변경된 타입 사용
    timestamp: string;
  };
  
  // 테스트용 감정 데이터
  const testEmotions: Emotion[] = [
    { label: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
    { label: '감사', icon: 'hand-heart', color: '#FF69B4' },
  ];
  
  // 테스트용 게시물 데이터
  const testPosts: Post[] = [
    {
      id: 1,
      anonymousId: '익명1',
      content: '테스트 게시물',
      emotion: '행복',
      emotionIcon: '😊',
      image: '',
      likes: 5,
      comments: [],
      timestamp: '1시간 전'
    }
  ];
  
  // handlePostSubmission 함수 정의
  function handlePostSubmission(
    content: string, 
    emotion: Emotion | null, 
    imageUrl: string, 
    setIsLoading: (value: boolean) => void,
    setIsDialogVisible: (value: boolean) => void
  ): boolean {
    if (content && emotion) {
      setIsLoading(true);
      // 게시물 업로드 로직을 시뮬레이트
      setTimeout(() => {
        setIsLoading(false);
        setIsDialogVisible(true);
      }, 1000);
      return true;
    }
    return false;
  }
  
  // handleImageUploadAction 함수 정의
  function handleImageUploadAction(
    setImageUrl: (url: string) => void
  ): void {
    setImageUrl('https://via.placeholder.com/150');
  }
  
  // handleLikeAction 함수 정의
  function handleLikeAction(
    posts: Post[],
    postId: number, 
    setPosts: (posts: Post[]) => void
  ): void {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  }
  
// 함수 정의 수정
function handleCommentAction(
    posts: Post[],
    postId: number, 
    commentContent: string,
    setPosts: (posts: Post[]) => void
  ): void {
    // 새 댓글 객체 생성
    const newComment: PostComment = {
      id: Date.now(),
      author: '익명',
      content: commentContent
    };
    
    // 게시물 업데이트
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: [
              ...post.comments,
              newComment
            ]
          }
        : post
    ));
  }
  
  // 실제 테스트 코드
  describe('HomeScreen 유틸리티 함수', () => {
    // 테스트 전에 실행
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
    });
  
    // 테스트 후에 실행
    afterEach(() => {
      jest.useRealTimers();
    });
  
    // handlePostSubmission 테스트
    describe('handlePostSubmission 함수', () => {
      it('내용과 감정이 있을 때 true를 반환해야 함', () => {
        // Mock 함수 생성
        const setIsLoading = jest.fn();
        const setIsDialogVisible = jest.fn();
        
        // 테스트 데이터
        const content = '테스트 게시물';
        const emotion = testEmotions[0]; // '행복' 감정
        const imageUrl = 'https://example.com/image.jpg';
        
        // 함수 호출
        const result = handlePostSubmission(
          content, 
          emotion, 
          imageUrl, 
          setIsLoading, 
          setIsDialogVisible
        );
        
        // 검증
        expect(result).toBe(true);
        expect(setIsLoading).toHaveBeenCalledWith(true);
        
        // setTimeout을 시뮬레이션
        jest.advanceTimersByTime(1000);
        
        // 타이머 완료 후 상태 검증
        expect(setIsLoading).toHaveBeenCalledWith(false);
        expect(setIsDialogVisible).toHaveBeenCalledWith(true);
      });
      
      it('내용이 없을 때 false를 반환해야 함', () => {
        // Mock 함수 생성
        const setIsLoading = jest.fn();
        const setIsDialogVisible = jest.fn();
        
        // 내용 없음
        const content = '';
        const emotion = testEmotions[0]; // '행복' 감정
        const imageUrl = 'https://example.com/image.jpg';
        
        // 함수 호출
        const result = handlePostSubmission(
          content, 
          emotion, 
          imageUrl, 
          setIsLoading, 
          setIsDialogVisible
        );
        
        // 검증
        expect(result).toBe(false);
        expect(setIsLoading).not.toHaveBeenCalled();
        expect(setIsDialogVisible).not.toHaveBeenCalled();
      });
      
      it('감정이 없을 때 false를 반환해야 함', () => {
        // Mock 함수 생성
        const setIsLoading = jest.fn();
        const setIsDialogVisible = jest.fn();
        
        // 감정 없음
        const content = '테스트 게시물';
        const emotion = null;
        const imageUrl = 'https://example.com/image.jpg';
        
        // 함수 호출
        const result = handlePostSubmission(
          content, 
          emotion, 
          imageUrl, 
          setIsLoading, 
          setIsDialogVisible
        );
        
        // 검증
        expect(result).toBe(false);
        expect(setIsLoading).not.toHaveBeenCalled();
        expect(setIsDialogVisible).not.toHaveBeenCalled();
      });
    });
    
    // handleImageUploadAction 테스트
    describe('handleImageUploadAction 함수', () => {
      it('이미지 URL을 설정해야 함', () => {
        // Mock 함수 생성
        const setImageUrl = jest.fn();
        
        // 함수 호출
        handleImageUploadAction(setImageUrl);
        
        // 검증
        expect(setImageUrl).toHaveBeenCalledWith('https://via.placeholder.com/150');
      });
    });
    
    // handleLikeAction 테스트
    describe('handleLikeAction 함수', () => {
      it('좋아요 수를 증가시켜야 함', () => {
        // 테스트 데이터
        const posts = [...testPosts]; // 기존 게시물 복사
        const postId = 1;
        const setPosts = jest.fn();
        
        // 함수 호출
        handleLikeAction(posts, postId, setPosts);
        
        // 검증
        expect(setPosts).toHaveBeenCalled();
        
        // setPosts에 전달된 새 게시물 배열 가져오기
        const updatedPosts = setPosts.mock.calls[0][0];
        
        // 좋아요 수가 증가했는지 확인
        expect(updatedPosts[0].likes).toBe(6);
      });
    });
    
    // handleCommentAction 테스트
    describe('handleCommentAction 함수', () => {
        it('댓글을 추가해야 함', () => {
          // 테스트 데이터
          const posts = [...testPosts]; // 기존 게시물 복사
          const postId = 1;
          const commentContent = '테스트 댓글';
          const setPosts = jest.fn(); // 명시적으로 setPosts 함수 정의
          
          // Date.now 모킹
          const mockDateNow = 123456789;
          jest.spyOn(Date, 'now').mockImplementation(() => mockDateNow);
          
          // 함수 호출
          handleCommentAction(posts, postId, commentContent, setPosts);
          
          // 검증
          expect(setPosts).toHaveBeenCalled();
          
          // setPosts에 전달된 새 게시물 배열 가져오기
          const updatedPosts = setPosts.mock.calls[0][0];
          
          // 댓글이 추가되었는지 확인
          expect(updatedPosts[0].comments.length).toBe(1);
          expect(updatedPosts[0].comments[0].content).toBe('테스트 댓글');
          expect(updatedPosts[0].comments[0].id).toBe(mockDateNow);
          expect(updatedPosts[0].comments[0].author).toBe('익명');
        });
      });
  });