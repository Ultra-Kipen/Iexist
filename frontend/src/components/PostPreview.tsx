// components/PostPreview.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
// 날짜 포맷팅 유틸 함수
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // 날짜를 YYYY-MM-DD HH:MM 형식으로 포맷팅
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 감정 타입 정의
interface Emotion {
  emotion_id: number;
  name: string;
  icon: string;
  color: string;
}

// 태그 타입 정의
interface Tag {
  tag_id: number;
  name: string;
}

// 포스트 타입 정의
interface PostPreviewProps {
  postType: 'myDay' | 'someoneDay' | 'comfort';
  post: {
    post_id: number;
    title?: string;
    content: string;
    created_at: string;
    like_count: number;
    comment_count: number;
    is_anonymous: boolean;
    image_url?: string;
    emotions?: Emotion[];
    tags?: Tag[];
    user?: {
      nickname: string;
      profile_image_url?: string;
    };
  };
  onPress: (postId: number) => void;
}

const PostPreview: React.FC<PostPreviewProps> = ({ postType, post, onPress }) => {
  // 날짜 포맷팅
  const formattedDate = formatDate(post.created_at);
  
  // 내용 요약 (최대 100자)
  const summarizedContent = post.content.length > 100
    ? `${post.content.substring(0, 100)}...`
    : post.content;
  
  // 포스트 클릭 핸들러
  const handlePress = () => {
    onPress(post.post_id);
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {/* 헤더 - 작성자 정보와 날짜 */}
      <View style={styles.header}>
        {/* 작성자 정보 (익명이 아닌 경우에만 표시) */}
        <View style={styles.userInfo}>
          {!post.is_anonymous && post.user ? (
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
          ) : (
            <>
              <Image 
                source={require('../assets/images/anonymous_avatar.png')} 
                style={styles.avatar} 
              />
              <Text style={styles.username}>익명</Text>
            </>
          )}
        </View>
        
        {/* 날짜 */}
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      
      {/* 포스트 내용 */}
      <View style={styles.content}>
        {/* 제목 (누군가의 하루, 위로의 벽인 경우에만) */}
        {(postType === 'someoneDay' || postType === 'comfort') && post.title && (
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {post.title}
          </Text>
        )}
        
        {/* 내용 요약 */}
        <Text style={styles.contentText} numberOfLines={3} ellipsizeMode="tail">
          {summarizedContent}
        </Text>
        
        {/* 감정 태그 (내 하루인 경우) */}
        {postType === 'myDay' && post.emotions && post.emotions.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.emotions.map((emotion) => (
              <View 
                key={emotion.emotion_id} 
                style={[styles.tag, { backgroundColor: emotion.color + '30' }]}
              >
                <Text style={[styles.tagText, { color: emotion.color }]}>
                  {emotion.name}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* 일반 태그 (누군가의 하루, 위로의 벽인 경우) */}
        {(postType === 'someoneDay' || postType === 'comfort') && post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag) => (
              <View key={tag.tag_id} style={styles.tag}>
                <Text style={styles.tagText}>#{tag.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* 이미지 (있는 경우) */}
      {post.image_url && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: post.image_url }} style={styles.image} />
        </View>
      )}
      
      {/* 하단 (좋아요, 댓글 수) */}
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>♥</Text>
          <Text style={styles.statText}>{post.like_count}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>💬</Text>
          <Text style={styles.statText}>{post.comment_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14171A',
  },
  date: {
    fontSize: 12,
    color: '#657786',
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    color: '#14171A',
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E8EDF0',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4A6572',
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E1E8ED',
    paddingTop: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
    color: '#657786',
  },
  statText: {
    fontSize: 14,
    color: '#657786',
  },
});

export default PostPreview;