// src/components/PostItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Emotion {
  id: number;
  name: string;
  color: string;
}

interface PostItemProps {
  id: number;
  content: string;
  userName: string;
  isAnonymous: boolean;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  imageUrl?: string;
  emotions?: Emotion[];
  onPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  isLiked?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({
  content,
  userName,
  isAnonymous,
  createdAt,
  likeCount,
  commentCount,
  imageUrl,
  emotions,
  onPress,
  onLikePress,
  onCommentPress,
  isLiked = false,
}) => {
  const displayName = isAnonymous ? '익명' : userName;
  const formattedDate = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\./g, '.').replace(/\s/g, ' ');

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {content}
      </Text>

      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      )}

      {emotions && emotions.length > 0 && (
        <View style={styles.emotionsContainer}>
          {emotions.map(emotion => (
            <View key={emotion.id} style={[styles.emotionTag, { backgroundColor: `${emotion.color}20` }]}>
              <Text style={[styles.emotionText, { color: emotion.color }]}>
                {emotion.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={onLikePress} style={styles.actionButton}>
          <Text style={[styles.iconText, { color: isLiked ? '#FF6B6B' : '#666666' }]}>
            {isLiked ? '♥' : '♡'}
          </Text>
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {likeCount > 0 ? likeCount : '공감'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onCommentPress} style={styles.actionButton}>
          <Text style={styles.iconText}>💬</Text>
          <Text style={styles.actionText}>
            {commentCount > 0 ? commentCount : '댓글'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  date: {
    fontSize: 12,
    color: '#999999',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  iconText: {
    fontSize: 18,
    marginRight: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  likedText: {
    color: '#FF6B6B',
  },
});

export default PostItem;