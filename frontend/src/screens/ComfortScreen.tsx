// src/screens/ComfortScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import {
  Card,
  TextInput,
  Button,
  List,
  Title,
  Paragraph,
  useTheme,
  FAB,
  ActivityIndicator,
  Chip,
  Text
} from 'react-native-paper';
import comfortWallService from '../services/api/comfortWallService';
import postService from '../services/api/postService'; // 새로 추가

interface ComfortPost {
  post_id: number;
  title: string;
  content: string;
  user_id: number;
  is_anonymous: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at?: string;
  tags?: string[];
}

interface BestPost {
  post_id: number;
  title: string;
  content: string;
  like_count: number;
  comment_count: number;
}

const ComfortScreen = ({ navigation }: any) => {
  const [posts, setPosts] = useState<ComfortPost[]>([]);
  const [bestPosts, setBestPosts] = useState<BestPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ComfortPost | null>(null);
  const [message, setMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]); // 좋아요 상태 추가
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 게시물 불러오기
      const response = await comfortWallService.getPosts();
      setPosts(response.data.data || []);
      
      // 베스트 게시물 불러오기
      const bestResponse = await comfortWallService.getBestPosts();
      setBestPosts(bestResponse.data.data || []);
    } catch (error) {
      Alert.alert('오류', '게시물을 불러오는 중 오류가 발생했습니다.');
      console.error('게시물 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await comfortWallService.createPost({
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        is_anonymous: isAnonymous
      });
      
      Alert.alert(
        '성공',
        '게시물이 등록되었습니다.',
        [{ text: '확인', onPress: () => {
          setShowNewPostModal(false);
          setNewPostTitle('');
          setNewPostContent('');
          loadData(); // 게시물 목록 새로고침
        }}]
      );
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.response?.data?.message || '게시물 등록 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 좋아요 처리 함수 추가
  const handleLike = async (postId: number) => {
    setIsSubmitting(true);
    try {
      await postService.likePost(postId);
      
      // 좋아요 상태 토글
      if (likedPosts.includes(postId)) {
        setLikedPosts(likedPosts.filter(id => id !== postId));
      } else {
        setLikedPosts([...likedPosts, postId]);
      }
      
      // 게시물 목록 새로고침
      loadData();
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.response?.data?.message || '좋아요 처리 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMessageModal = (post: ComfortPost) => {
    setSelectedPost(post);
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!selectedPost || !message.trim()) {
      Alert.alert('알림', '메시지 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await comfortWallService.sendMessage(selectedPost.post_id, {
        message: message.trim(),
        is_anonymous: isAnonymous
      });
      
      Alert.alert(
        '성공',
        '메시지가 전송되었습니다.',
        [{ text: '확인', onPress: () => {
          setShowMessageModal(false);
          setMessage('');
          loadData(); // 게시물 목록 새로고침
        }}]
      );
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.response?.data?.message || '메시지 전송 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="loading-indicator">
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>게시물을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} testID="comfort-screen-scrollview">
        {/* 베스트 게시물 섹션 */}
        {bestPosts.length > 0 && (
          <View style={styles.bestPostsSection}>
            <Title style={styles.sectionTitle} testID="best-posts-title">이번 주 베스트 게시물</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {bestPosts.map(post => (
                <Card key={post.post_id} style={styles.bestPostCard}>
                  <Card.Content>
                    <Title numberOfLines={1}>{post.title}</Title>
                    <Paragraph numberOfLines={2}>{post.content}</Paragraph>
                    <View style={styles.postStats}>
                      <Chip 
                        icon={likedPosts.includes(post.post_id) ? "thumb-up" : "thumb-up-outline"} 
                        onPress={() => handleLike(post.post_id)} 
                        testID={`like-button-${post.post_id}`}
                      >
                        {post.like_count}
                      </Chip>
                      <Chip icon="comment" style={styles.commentChip}>{post.comment_count}</Chip>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 고민 게시판 */}
        <Title style={styles.title}>다른 사용자들의 고민</Title>
        <List.Section testID="posts-list">
          {posts.length > 0 ? (
            posts.map(post => (
              <List.Item
                key={post.post_id}
                title={post.title}
                description={`${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`}
                left={props => <List.Icon {...props} icon="comment-outline" />}
                right={props => (
                  <View style={{ flexDirection: 'row' }}>
                    <Button 
                      mode="text" 
                      onPress={() => handleLike(post.post_id)}
                      testID={`like-button-${post.post_id}`}
                      icon={likedPosts.includes(post.post_id) ? "thumb-up" : "thumb-up-outline"}
                    >
                      {post.like_count}
                    </Button>
                    <Button 
                      mode="text" 
                      onPress={() => openMessageModal(post)}
                      testID={`comment-button-${post.post_id}`}
                    >
                      응원하기
                    </Button>
                  </View>
                )}
                onPress={() => openMessageModal(post)}
                style={styles.listItem}
              />
            ))
          ) : (
            <Paragraph style={styles.emptyText}>고민 게시물이 없습니다. 새로운 고민을 공유해보세요!</Paragraph>
          )}
        </List.Section>
      </ScrollView>

      {/* 새 게시물 작성 버튼 */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => setShowNewPostModal(true)}
        testID="new-post-button"
      />

      {/* 새 게시물 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNewPostModal}
        onRequestClose={() => setShowNewPostModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>고민 나누기</Title>
            
            <TextInput
              mode="outlined"
              label="제목"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
              style={styles.input}
              testID="post-title-input"
            />
            
            <TextInput
              mode="outlined"
              label="고민 내용"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={4}
              style={styles.input}
              testID="post-content-input"
            />
            
            <View style={styles.anonymousOption}>
              <Paragraph>익명으로 게시하기</Paragraph>
              <TouchableOpacity 
                onPress={() => setIsAnonymous(!isAnonymous)}
                style={styles.checkbox}
                testID="anonymous-checkbox"
              >
                {isAnonymous && <View style={styles.checkboxInner} />}
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setShowNewPostModal(false)}
                style={styles.modalButton}
                testID="cancel-post-button"
              >
                취소
              </Button>
              <Button 
                mode="contained" 
                onPress={handlePost}
                style={styles.modalButton}
                loading={isSubmitting}
                disabled={isSubmitting}
                testID="submit-post-button"
              >
                게시하기
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* 메시지 전송 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMessageModal}
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>응원 메시지 보내기</Title>
            
            {selectedPost && (
              <View style={styles.selectedPostInfo}>
                <Title numberOfLines={1}>{selectedPost.title}</Title>
                <Paragraph numberOfLines={3}>{selectedPost.content}</Paragraph>
              </View>
            )}
            
            <TextInput
              mode="outlined"
              label="응원 메시지"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              style={styles.input}
              testID="comment-input"
            />
            
            <View style={styles.anonymousOption}>
              <Paragraph>익명으로 전송하기</Paragraph>
              <TouchableOpacity 
                onPress={() => setIsAnonymous(!isAnonymous)}
                style={styles.checkbox}
                testID="anonymous-checkbox"
              >
                {isAnonymous && <View style={styles.checkboxInner} />}
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setShowMessageModal(false)}
                style={styles.modalButton}
                testID="cancel-message-button"
              >
                취소
              </Button>
              <Button 
                mode="contained" 
                onPress={sendMessage}
                style={styles.modalButton}
                loading={isSubmitting}
                disabled={isSubmitting}
                testID="submit-comment-button"
              >
                전송하기
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // 기존 스타일 유지...
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  bestPostsSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bestPostCard: {
    width: 280,
    marginLeft: 16,
    marginRight: 8,
  },
  postStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  commentChip: {
    marginLeft: 8,
  },
  title: {
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  listItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  anonymousOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 16,
    height: 16,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  selectedPostInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default ComfortScreen;