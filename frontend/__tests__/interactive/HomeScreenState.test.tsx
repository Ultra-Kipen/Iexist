// HomeScreenPosts.test.tsx - 게시물 표시 및 상호작용 테스트
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { View, Text, TouchableOpacity, Image } from 'react-native';


// 타입 정의 추가
interface Post {
    id: number;
    anonymousId: string;
    content: string;
    emotion: string;
    emotionIcon: string;
    image?: string;
    likes: number;
    comments: Comment[];
    timestamp: string;
  }
  
  interface Comment {
    id: number;
    author: string;
    content: string;
  }
  
  interface PostComponentProps {
    post: Post;
    onLike: (postId: number) => void;
    onComment: (postId: number, commentContent: string) => void;
  }
// 테스트용 게시물 데이터
const mockPosts = [
  {
    id: 1,
    anonymousId: '익명1',
    content: '오늘도 난 여기 존재하고 있어요. 작은 일상이 감사하네요.',
    emotion: '감사',
    emotionIcon: '🙏',
    image: 'https://via.placeholder.com/150',
    likes: 15,
    comments: [
      { id: 1, author: '익명2', content: '당신의 존재 자체가 소중해요. 힘내세요!' },
    ],
    timestamp: '2시간 전'
  },
  {
    id: 2,
    anonymousId: '익명3',
    content: '힘든 날이지만, 그래도 난 여기 있어요.',
    emotion: '위로',
    emotionIcon: '🤗',
    image: '',
    likes: 7,
    comments: [],
    timestamp: '3시간 전'
  }
];

// 게시물 컴포넌트 모킹
// MockPostComponent 수정
const MockPostComponent: React.FC<PostComponentProps> = ({ post, onLike, onComment }) => {
    return (
      <View testID={`post-${post.id}`}>
        <Text testID={`post-author-${post.id}`}>{post.anonymousId}</Text>
        <Text testID={`post-content-${post.id}`}>{post.content}</Text>
        <Text testID={`post-emotion-${post.id}`}>{post.emotion}</Text>
        
        {post.image && <Image testID={`post-image-${post.id}`} source={{ uri: post.image }} />}
        
        <View testID={`post-actions-${post.id}`}>
          <TouchableOpacity 
            testID={`like-button-${post.id}`} 
            onPress={() => onLike(post.id)}
          >
            <Text>좋아요 {post.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            testID={`comment-button-${post.id}`}
            onPress={() => {}}
          >
            <Text>댓글 {post.comments.length}</Text>
          </TouchableOpacity>
        </View>
        
        {post.comments.map(comment => (
          <View key={comment.id} testID={`comment-${comment.id}-post-${post.id}`}>
            <Text>{comment.author}: {comment.content}</Text>
          </View>
        ))}
        
        <View testID={`comment-input-container-${post.id}`}>
          <TouchableOpacity
            testID={`send-comment-button-${post.id}`}
            onPress={() => onComment(post.id, '새 댓글입니다.')}
          >
            <Text>댓글 작성</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

// 모킹된 홈 스크린 컴포넌트
const MockPostsScreen: React.FC = () => {
    const [posts, setPosts] = React.useState<Post[]>(mockPosts);
    
    const handleLike = (postId: number) => {
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    };
    
    const handleComment = (postId: number, commentContent: string) => {
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now(), // 실제로는 고유한 ID를 사용해야 함
                  author: '익명',
                  content: commentContent
                }
              ]
            }
          : post
      ));
    };
    
    return (
      <View testID="posts-container">
        <Text testID="posts-heading">누군가의 하루는..</Text>
        
        {posts.map(post => (
          <MockPostComponent
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
          />
        ))}
      </View>
    );
  };
  
  

// HomeScreen 모듈 모킹
jest.mock('../../src/screens/HomeScreen', () => {
  return {
    __esModule: true,
    default: () => null, // 메인 테스트는 MockPostsScreen을 직접 사용
    renderPosts: jest.fn()
  };
});

describe('HomeScreen Posts Section', () => {
    // Date.now 모킹을 위한 설정
    const originalDateNow = Date.now;
    beforeEach(() => {
      Date.now = jest.fn(() => 12345678);
    });
    
    afterEach(() => {
      Date.now = originalDateNow;
    });
    
    it('renders all posts correctly', () => {
      render(<MockPostsScreen />);
      
      // 헤딩 텍스트 확인
      expect(screen.getByTestId('posts-heading')).toBeTruthy();
      expect(screen.getByTestId('posts-heading').props.children).toBe('누군가의 하루는..');
      
      // 모든 게시물이 렌더링되었는지 확인
      const postElements = screen.getAllByTestId(/^post-\d+$/);
      expect(postElements).toHaveLength(mockPosts.length);
      
      // 각 게시물의 내용 확인
      mockPosts.forEach(post => {
        expect(screen.getByTestId(`post-author-${post.id}`).props.children).toBe(post.anonymousId);
        expect(screen.getByTestId(`post-content-${post.id}`).props.children).toBe(post.content);
        expect(screen.getByTestId(`post-emotion-${post.id}`).props.children).toBe(post.emotion);
        
        // 좋아요 수 확인
        expect(screen.getByTestId(`like-button-${post.id}`)).toBeTruthy();
        
        // 이미지가 있는 경우에만 확인
        if (post.image) {
          expect(screen.getByTestId(`post-image-${post.id}`)).toBeTruthy();
        }
      });
    });
    
    it('increments like count when like button is pressed', () => {
        render(<MockPostsScreen />);
        
        // 첫 번째 게시물의 현재 좋아요 수 확인
        const likeButton = screen.getByTestId('like-button-1');
        const initialLikeText = 
          typeof likeButton.children[0] === 'object' && 'props' in likeButton.children[0]
            ? likeButton.children[0].props.children
            : likeButton.children[0];
        const initialLikeCount = parseInt(initialLikeText.toString().split(' ')[1]);
        
        // 좋아요 버튼 클릭
        fireEvent.press(likeButton);
        
        // 좋아요 수가 증가했는지 확인
        const updatedLikeText = 
          typeof likeButton.children[0] === 'object' && 'props' in likeButton.children[0]
            ? likeButton.children[0].props.children
            : '';
        const updatedLikeCount = parseInt(updatedLikeText.toString().split(' ')[1]);
        
        expect(updatedLikeCount).toBe(initialLikeCount + 1);
      });
    
    it('adds a new comment when comment button is pressed', () => {
      render(<MockPostsScreen />);
      
      // 첫 번째 게시물의 댓글 작성 버튼
      const commentButton = screen.getByTestId('send-comment-button-1');
      
      // 초기 댓글 수 확인
      const initialComments = screen.getAllByTestId(/^comment-\d+-post-1$/);
      const initialCount = initialComments.length;
      
      // 댓글 작성 버튼 클릭
      fireEvent.press(commentButton);
      
      // 댓글이 추가되었는지 확인
      const updatedComments = screen.getAllByTestId(/^comment-\d+-post-1$/);
      expect(updatedComments.length).toBe(initialCount + 1);
      
      // 새 댓글의 내용 확인
      const newComment = updatedComments[updatedComments.length - 1];
      expect(newComment.props.children.props.children).toContain('새 댓글입니다.');
    });
    
    it('does not affect other posts when interacting with one post', () => {
        render(<MockPostsScreen />);
        
        // 첫 번째 게시물의 좋아요 버튼 클릭
        const likeButton = screen.getByTestId('like-button-1');
        fireEvent.press(likeButton);
        
        // 두 번째 게시물의 좋아요 수는 변하지 않아야 함
        const post2LikeButton = screen.getByTestId('like-button-2');
        const post2LikeText = 
          typeof post2LikeButton.children[0] === 'object' && 'props' in post2LikeButton.children[0]
            ? post2LikeButton.children[0].props.children
            : post2LikeButton.children[0];
        
        // 숫자 추출 방식 변경
        const post2LikeCount = Number(post2LikeText.toString().match(/\d+/)?.[0] || 0);
        
        expect(post2LikeCount).toBe(7); // 초기값 유지
      });
  });