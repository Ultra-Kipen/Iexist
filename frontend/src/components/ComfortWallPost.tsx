// components/ComfortWallPost.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// 날짜 포맷팅 유틸 함수
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // 날짜를 YYYY년 MM월 DD일 HH:MM 형식으로 포맷팅
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

interface Comment {
  comment_id: number;
  user_id: number;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  user?: {
    nickname: string;
    profile_image_url?: string;
  };
}

interface ComfortWallPostProps {
  post: {
    post_id: number;
    title: string;
    content: string;
    created_at: string;
    like_count: number;
    comment_count: number;
    is_anonymous: boolean;
    user?: {
      nickname: string;
      profile_image_url?: string;
    };
    image_url?: string;
    comments?: Comment[];
  };
  onLikePress: (postId: number) => void;
  onCommentPress: (postId: number) => void;
  onPostPress: (postId: number) => void;
  isLiked?: boolean;
}

const ComfortWallPost: React.FC<ComfortWallPostProps> = ({
  post,
  onLikePress,
  onCommentPress,
  onPostPress,
  isLiked = false
}) => {
  const [liked, setLiked] = useState<boolean>(isLiked);
  const [likeCount, setLikeCount] = useState<number>(post.like_count);
  const [showFullContent, setShowFullContent] = useState<boolean>(false);
  
  // 최대 표시할 텍스트 길이
  const MAX_CONTENT_LENGTH = 150;
  
  // 내용이 MAX_CONTENT_LENGTH보다 긴지 확인
  const isLongContent = post.content.length > MAX_CONTENT_LENGTH;
  
  // 표시할 내용 계산
  const displayContent = showFullContent ? 
    post.content : 
    (isLongContent ? `${post.content.substring(0, MAX_CONTENT_LENGTH)}...` : post.content);
  
  // 날짜 포맷팅
  const formattedDate = formatDate(post.created_at);

  // 좋아요 버튼 클릭 핸들러
  const handleLikePress = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prevCount => prevCount + (newLiked ? 1 : -1));
    onLikePress(post.post_id);
  };

  // 댓글 버튼 클릭 핸들러
  const handleCommentPress = () => {
    onCommentPress(post.post_id);
  };

  // 게시물 클릭 핸들러
  const handlePostPress = () => {
    onPostPress(post.post_id);
  };

  // 더 보기/접기 버튼 클릭 핸들러
  const toggleShowFullContent = () => {
    setShowFullContent(!showFullContent);
  };

  return (
    <View style={styles.container}>
      {/* 게시물 헤더 */}
      <TouchableOpacity onPress={handlePostPress} style={styles.header}>
        <View style={styles.userInfo}>
          {!post.is_anonymous && post.user && (
            <>
              <Image 
                source={
                  post.user.profile_image_url 
                    ? { uri: post.user.profile_image_url } 
                    : require('../assets/images/default_avatar.png')
                } 
                style={styles.avatar} 
              />
              <Text style={styles.username}>{post.user.nickname}</Text>
            </>
          )}
          {post.is_anonymous && (
            <>
              <Image 
                source={require('../assets/images/anonymous_avatar.png')} 
                style={styles.avatar} 
              />
              <Text style={styles.username}>익명</Text>
            </>
          )}
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </TouchableOpacity>

      {/* 게시물 제목 */}
      <TouchableOpacity onPress={handlePostPress}>
        <Text style={styles.title}>{post.title}</Text>
      </TouchableOpacity>

      {/* 게시물 내용 */}
      <TouchableOpacity onPress={handlePostPress}>
        <Text style={styles.content}>{displayContent}</Text>
        {isLongContent && (
          <TouchableOpacity onPress={toggleShowFullContent} style={styles.showMoreButton}>
            <Text style={styles.showMoreText}>
              {showFullContent ? '접기' : '더 보기'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* 게시물 이미지 (있는 경우) */}
      // ComfortWallPost.tsx 의 이미지 부분 수정
{post.image_url && (
  <TouchableOpacity onPress={handlePostPress} style={styles.imageContainer}>
    <Image 
      source={{ uri: post.image_url }} 
      style={styles.image} 
      testID="post-image" 
    />
  </TouchableOpacity>
)}

      {/* 게시물 작업 버튼 (좋아요, 댓글) */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          onPress={handleLikePress} 
          style={[styles.actionButton, liked && styles.likedButton]}
        >
          <Text style={[styles.actionText, liked && styles.likedText]}>
            ♥ 좋아요 {likeCount > 0 ? likeCount : ''}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleCommentPress} style={styles.actionButton}>
          <Text style={styles.actionText}>
            💬 댓글 {post.comment_count > 0 ? post.comment_count : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 댓글 미리보기 (최대 2개) */}
      {post.comments && post.comments.length > 0 && (
        <View style={styles.commentsPreview}>
          {post.comments.slice(0, 2).map(comment => (
            <View key={comment.comment_id} style={styles.commentItem}>
              <Text style={styles.commentUser}>
                {comment.is_anonymous ? '익명' : comment.user?.nickname || '사용자'}:
              </Text>
              <Text style={styles.commentContent}>
                {comment.content.length > 50 
                  ? `${comment.content.substring(0, 50)}...` 
                  : comment.content}
              </Text>
            </View>
          ))}
          
          {post.comments.length > 2 && (
            <TouchableOpacity 
              onPress={handleCommentPress}
              style={styles.showMoreCommentsButton}
            >
              <Text style={styles.showMoreCommentsText}>
                댓글 {post.comments.length - 2}개 더 보기
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
  },
  date: {
    fontSize: 12,
    color: '#657786',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#14171A',
    lineHeight: 22,
    marginBottom: 12,
  },
  showMoreButton: {
    marginTop: -4,
    marginBottom: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: '#4A6572',
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#657786',
  },
  likedButton: {
    backgroundColor: 'rgba(224, 36, 94, 0.1)',
  },
  likedText: {
    color: '#E0245E',
    fontWeight: '600',
  },
  commentsPreview: {
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    paddingTop: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14171A',
    marginRight: 6,
  },
  commentContent: {
    fontSize: 14,
    color: '#14171A',
    flex: 1,
  },
  showMoreCommentsButton: {
    padding: 4,
  },
  showMoreCommentsText: {
    fontSize: 14,
    color: '#4A6572',
    textAlign: 'center',
  },
});

export default ComfortWallPost;