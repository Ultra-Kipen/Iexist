// src/screens/PostDetailScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import postService from '../services/api/postService';
import LoadingIndicator from '../components/LoadingIndicator';
import CommentItem from '../components/CommentItem';
import ProfileAvatar from '../components/ProfileAvatar';
import Button from '../components/Button';

// 타입 정의
type PostDetailRouteParams = {
  postId: number;
};

type RootStackParamList = {
  PostDetail: PostDetailRouteParams;
};

type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

interface Post {
  post_id: number;
  user_id: number;
  username: string;
  nickname: string | null;
  content: string;
  emotion_summary: string | null;
  image_url: string | null;
  is_anonymous: boolean;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  created_at: string;
  emotions: {
    emotion_id: number;
    name: string;
    color: string;
  }[];
}

interface Comment {
  comment_id: number;
  user_id: number;
  username: string;
  nickname: string | null;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PostDetailRouteProp>();
  const { postId } = route.params;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPostData();
  }, [postId]);

  const fetchPostData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const postResponse = await postService.getPostById(postId);
      const commentsResponse = await postService.getComments(postId);
      
      setPost(postResponse.data.data);
      setComments(commentsResponse.data.data);
    } catch (err) {
      console.error('게시물 데이터 로딩 오류:', err);
      setError('게시물 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePress = async () => {
    if (!post) return;
    
    try {
      await postService.likePost(postId);
      
      setPost({
        ...post,
        is_liked: !post.is_liked,
        like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1,
      });
    } catch (err) {
      console.error('좋아요 처리 오류:', err);
      Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await postService.addComment(postId, {
        content: commentText.trim(),
        is_anonymous: isAnonymous,
      });
      
      const newComment = response.data.data;
      setComments([...comments, newComment]);
      setCommentText('');
      
      // 게시물의 댓글 수 업데이트
      if (post) {
        setPost({
          ...post,
          comment_count: post.comment_count + 1,
        });
      }
      
      // 댓글 목록으로 스크롤
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (err) {
      console.error('댓글 작성 오류:', err);
      Alert.alert('오류', '댓글 작성 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingIndicator text="게시물 로딩 중..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="다시 시도" onPress={fetchPostData} type="primary" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>게시물을 찾을 수 없습니다.</Text>
        <Button 
          title="뒤로 가기" 
          onPress={() => navigation.goBack()} 
          type="primary" 
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <ProfileAvatar
                name={post.is_anonymous ? '익명' : (post.nickname || post.username)}
                isAnonymous={post.is_anonymous}
                size={40}
              />
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>
                  {post.is_anonymous ? '익명' : (post.nickname || post.username)}
                </Text>
                <Text style={styles.date}>{formatDate(post.created_at)}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.content}>{post.content}</Text>
          
          {post.image_url && (
            <Image source={{ uri: post.image_url }} style={styles.image} resizeMode="cover" />
          )}
          
          {post.emotions.length > 0 && (
  <View style={styles.emotionsContainer}>
    {post.emotions.map((emotion) => (
      <View
        key={emotion.emotion_id}
        style={[
          styles.emotionTag,
          { backgroundColor: `${emotion.color}20` },
        ]}
      >
        <Text
          style={[styles.emotionText, { color: emotion.color }]}
        >
          {emotion.name}
        </Text>
      </View>
    ))}
  </View>
)}
          
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLikePress}
            >
              <Text style={[styles.actionIcon, post.is_liked && styles.likedIcon]}>
                {post.is_liked ? '♥' : '♡'}
              </Text>
              <Text
                style={[styles.actionText, post.is_liked && styles.likedText]}
              >
                {post.like_count > 0 ? `${post.like_count}` : '공감'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>
                {post.comment_count > 0 ? `${post.comment_count}` : '댓글'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>
            댓글 {comments.length > 0 ? `(${comments.length})` : ''}
          </Text>
          
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.comment_id}
                id={comment.comment_id}
                content={comment.content}
                userName={comment.nickname || comment.username}
                isAnonymous={comment.is_anonymous}
                createdAt={comment.created_at}
              />
            ))
          ) : (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyText}>
                첫 번째 댓글을 작성해보세요!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.commentForm}>
        <View style={styles.anonymousContainer}>
          <TouchableOpacity
            style={styles.anonymousButton}
            onPress={() => setIsAnonymous(!isAnonymous)}
          >
            <View
              style={[
                styles.anonymousCheck,
                isAnonymous && styles.anonymousChecked,
              ]}
            >
              {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.anonymousText}>익명</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!commentText.trim() || submitting) && styles.disabledButton,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? '전송 중' : '전송'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
  },
  nameContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  date: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  emotionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  emotionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 4,
    color: '#666666',
  },
  likedIcon: {
    color: '#FF6B6B',
  },
  actionText: {
    fontSize: 14,
    color: '#666666',
  },
  likedText: {
    color: '#FF6B6B',
  },
  commentsContainer: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  emptyComments: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999999',
    fontSize: 14,
  },
  commentForm: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  anonymousContainer: {
    marginBottom: 8,
  },
  anonymousButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousCheck: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anonymousChecked: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  anonymousText: {
    fontSize: 14,
    color: '#666666',
  },
  inputContainer: {
    flexDirection: 'row',
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default PostDetailScreen;