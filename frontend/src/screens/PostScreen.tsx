// src/screens/PostScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import postService from '../services/api/postService';

interface PostScreenProps {
  route: {
    params: {
      postId: number;
    };
  };
  navigation: any;
}

const PostScreen: React.FC<PostScreenProps> = ({ route, navigation }) => {
  const { postId } = route.params;
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPostData();
    fetchComments();
  }, [postId]);

  const fetchPostData = async () => {
    try {
      setLoading(true);
      const response = await postService.getPostById(postId);
      setPost(response.data.post);
    } catch (error) {
      setError('게시물을 불러오는 중 오류가 발생했습니다');
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await postService.getComments(postId);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await postService.addComment(postId, {
        content: newComment,
        is_anonymous: isAnonymous
      });
      setNewComment('');
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      setError('댓글을 작성하는 중 오류가 발생했습니다');
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centerContainer}>
        <Text>게시물을 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Text style={styles.postDate}>
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
          <View style={styles.emotionTag}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color="#FFD700" />
            <Text style={styles.emotionText}>{post.emotion_summary}</Text>
          </View>
        </View>

        <Text style={styles.postContent}>{post.content}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="heart-outline" size={20} color="#FF6347" />
            <Text style={styles.statText} testID="like-count">{post.like_count}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="comment-outline" size={20} color="#4682B4" />
            <Text style={styles.statText} testID="comment-count">{post.comment_count}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>댓글 {comments.length}개</Text>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.comment_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Text style={styles.commentAuthor}>
              {item.is_anonymous ? '익명' : `사용자 ${item.user_id}`}
            </Text>
            <Text style={styles.commentContent}>{item.content}</Text>
            <Text style={styles.commentDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>첫 번째 댓글을 남겨보세요!</Text>
        }
      />

      <View style={styles.commentInputContainer}>
        <Button
          mode={isAnonymous ? "contained" : "outlined"}
          onPress={() => setIsAnonymous(!isAnonymous)}
          style={styles.anonymousButton}
        >
          익명
        </Button>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <Button
          mode="contained"
          onPress={handleAddComment}
          loading={submitting}
          disabled={submitting || !newComment.trim()}
        >
          게시
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postDate: {
    color: '#666',
    fontSize: 14,
  },
  emotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emotionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  commentItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  anonymousButton: {
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
  },
});

export default PostScreen;