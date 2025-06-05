// src/components/CommentItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CommentItemProps {
  id: number;
  content: string;
  userName: string;
  isAnonymous: boolean;
  createdAt: string;
  onReply?: () => void;
  onLike?: () => void;
  likeCount?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  content,
  userName,
  isAnonymous,
  createdAt,
  onReply,
  onLike,
  likeCount = 0,
}) => {
  const displayName = isAnonymous ? '익명' : userName;
  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).replace(/\./g, '.').replace(/\s/g, ' ')
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      // content 부분에 testID 추가
<Text style={styles.content} testID="content">{content}</Text>
      <View style={styles.footer}>
        {onLike && (
          <TouchableOpacity onPress={onLike} style={styles.button}>
            <Text style={styles.buttonText}>공감 {likeCount > 0 ? likeCount : ''}</Text>
          </TouchableOpacity>
        )}
        {onReply && (
          <TouchableOpacity onPress={onReply} style={styles.button}>
            <Text style={styles.buttonText}>답글</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
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
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  button: {
    marginRight: 16,
  },
  buttonText: {
    fontSize: 12,
    color: '#666666',
  },
});

export default CommentItem;