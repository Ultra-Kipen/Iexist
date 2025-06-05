// src/screens/MyPostsScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView
} from 'react-native';
import { Button, Card, Chip, Dialog, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import postService from '../services/api/postService';

// 게시물 타입 정의
interface Post {
  post_id: number;
  content: string;
  emotion_summary: string;
  like_count: number;
  comment_count: number;
  created_at: string;
}

interface MyPostsScreenProps {
  navigation: any;
  route: any;
}

const MyPostsScreen: React.FC<MyPostsScreenProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyPosts();
    
    // 화면에 포커스가 맞춰질 때마다 데이터 다시 로드
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyPosts();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getMyPosts({ sort_by: 'latest' });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching my posts:', error);
      Alert.alert('오류', '게시물을 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyPosts();
  };

  const showDeleteConfirm = (postId: number) => {
    setSelectedPostId(postId);
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setSelectedPostId(null);
  };

  const handleDeletePost = async () => {
    if (selectedPostId === null) return;
    
    try {
      await postService.deletePost(selectedPostId);
      setPosts(posts.filter(post => post.post_id !== selectedPostId));
      Alert.alert('성공', '게시물이 성공적으로 삭제되었습니다');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('오류', '게시물을 삭제하는 중 오류가 발생했습니다');
    } finally {
      hideDeleteDialog();
    }
  };

  const renderEmotionChip = (emotion: string) => {
    let iconName = 'emoticon-neutral-outline';
    let color = '#A9A9A9';
    
    switch (emotion) {
      case '행복':
        iconName = 'emoticon-happy-outline';
        color = '#FFD700';
        break;
      case '슬픔':
        iconName = 'emoticon-sad-outline';
        color = '#4682B4';
        break;
      case '감사':
        iconName = 'hand-heart';
        color = '#FF69B4';
        break;
      // 필요한 감정에 따라 추가
    }

    return (
      <Chip 
        icon={() => <MaterialCommunityIcons name={iconName as any} size={16} color={color} />}
        style={[styles.emotionChip, { backgroundColor: color + '20' }]}
      >
        {emotion}
      </Chip>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 게시물</Text>
        <Button 
          mode="contained"
          onPress={() => navigation.navigate('CreatePost')}
          testID="new-post-button"
        >
          새 게시물
        </Button>
      </View>

      <ScrollView 
        contentContainerStyle={styles.listContent}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text>로딩 중...</Text>
          </View>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <Card key={post.post_id} style={styles.postCard} testID="post-item">
              <Card.Content>
                <View style={styles.postHeader}>
                  <Text style={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </Text>
                  {renderEmotionChip(post.emotion_summary)}
                </View>
                
                <Text style={styles.postContent}>{post.content}</Text>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="heart-outline" size={18} color="#FF6347" />
                    <Text style={styles.statText}>{post.like_count}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="comment-outline" size={18} color="#4682B4" />
                    <Text style={styles.statText}>{post.comment_count}</Text>
                  </View>
                </View>
              </Card.Content>
              
              <Card.Actions>
                <Button onPress={() => navigation.navigate('Post', { postId: post.post_id })}>
                  자세히
                </Button>
                <Button 
                  testID="delete-button"
                  onPress={() => showDeleteConfirm(post.post_id)}
                  textColor="#f44336"
                >
                  삭제
                </Button>
              </Card.Actions>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer} testID="empty-state">
            <MaterialCommunityIcons name="post-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>게시물이 없습니다</Text>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('CreatePost')}
              style={{ marginTop: 16 }}
            >
              첫 게시물 작성하기
            </Button>
          </View>
        )}
      </ScrollView>

      {/* 다이얼로그 부분 */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={hideDeleteDialog}
        >
          <Dialog.Title>게시물 삭제</Dialog.Title>
          <Dialog.Content>
            <Text>정말로 이 게시물을 삭제하시겠습니까?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog}>취소</Button>
            <Button onPress={handleDeletePost} textColor="#f44336">삭제</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postDate: {
    color: '#666',
    fontSize: 14,
  },
  emotionChip: {
    height: 28,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 12,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

export default MyPostsScreen;