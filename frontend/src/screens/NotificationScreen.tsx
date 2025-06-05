// src/screens/NotificationScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import notificationService, { Notification } from '../services/api/notificationService';
import LoadingIndicator from '../components/LoadingIndicator';
import Button from '../components/Button';

interface NotificationScreenProps {
  testNotifications?: Notification[];
  testLoading?: boolean;
  testError?: string | null;
  testEmptyState?: boolean;  // 이 속성 추가
}

const NotificationScreen = (props: NotificationScreenProps = {}) => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>(props.testNotifications || []);
  const [loading, setLoading] = useState(props.testLoading !== undefined ? props.testLoading : true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(props.testError || null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

// 두 번째 useEffect 제거 (이미 첫 번째 useEffect에서 동일한 기능 수행)
useEffect(() => {
  if (props.testNotifications !== undefined) {
    setNotifications(props.testNotifications);
  }
  if (props.testLoading !== undefined) {
    setLoading(props.testLoading);
  }
  if (props.testError !== undefined) {
    setError(props.testError);
  }
  if (props.testEmptyState) {
    setNotifications([]);
  }
}, [props.testNotifications, props.testLoading, props.testError, props.testEmptyState]);
// src/screens/NotificationScreen.tsx (일부 수정)
const fetchNotifications = async (refresh = false) => {
  try {
    if (refresh) {
      setPage(1);
      setHasMore(true);
    }
    
    if (!hasMore && !refresh) return;
    
    setLoading(true);
    setError(null);
    
    const response = await notificationService.getNotifications({
      page: refresh ? 1 : page,
      limit: 20,
    });
    
    // 여기서 response 구조 수정
    const data = response.data || response;
    const pagination = response.pagination;
    
    if (refresh) {
      setNotifications(data);
    } else {
      setNotifications(prev => [...prev, ...data]);
    }
    
    setHasMore(!!pagination && pagination.page * pagination.limit < pagination.total);
    setPage(prev => refresh ? 2 : prev + 1);
  } catch (err) {
    console.error('알림 데이터 로딩 오류:', err);
    setError('알림을 불러오는 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications();
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // 읽음 표시
      if (!notification.is_read) {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      }
      
      // 관련 화면으로 이동
      navigateByNotificationType(notification);
    } catch (err) {
      console.error('알림 처리 오류:', err);
    }
  };

  const navigateByNotificationType = (notification: Notification) => {
    const { notification_type, related_id } = notification;
    
    if (!related_id) return;
    
    const nav = navigation as any; // 네비게이션 객체 자체를 any로 캐스팅
    
    switch (notification_type) {
      case 'like':
      case 'comment':
        nav.navigate('PostDetail', { postId: related_id });
        break;
      case 'challenge':
        nav.navigate('ChallengeDetail', { challengeId: related_id });
        break;
      default:
        // 시스템 알림은 특별한 화면으로 이동하지 않음
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      Alert.alert('성공', '모든 알림이 읽음 처리되었습니다.');
    } catch (err) {
      console.error('모두 읽음 처리 오류:', err);
      Alert.alert('오류', '알림 읽음 처리 중 문제가 발생했습니다.');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '♥';  // 하트 이모지
      case 'comment':
        return '💬';  // 댓글 이모지
      case 'challenge':
        return '🏆';  // 트로피 이모지
      case 'system':
        return '🔔';  // 종 이모지
      default:
        return '📌';  // 기본 이모지
    }
  };

  const getNotificationTime = (createdAt: string) => {
    const now = new Date();
    const notificationDate = new Date(createdAt);
    const diffInMilliseconds = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return notificationDate.toLocaleDateString('ko-KR');
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, item.is_read ? styles.readNotification : {}]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getNotificationIcon(item.notification_type)}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>{item.content}</Text>
        <Text style={styles.timeText}>{getNotificationTime(item.created_at)}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  if (loading && !refreshing && notifications.length === 0) {
    return <LoadingIndicator text="알림 로딩 중..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>알림</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>모두 읽음</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="다시 시도" onPress={() => fetchNotifications(true)} type="primary" />
        </View>
      )}
      
      {!error && notifications.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>알림이 없습니다.</Text>
        </View>
      )}
      
      <FlatList
        data={notifications}
        keyExtractor={(item: { id: { toString: () => any; }; }) => item.id.toString()}
        renderItem={renderNotificationItem}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && notifications.length > 0 ? <LoadingIndicator size="small" text="" /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  markAllText: {
    fontSize: 14,
    color: '#4A90E2',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  readNotification: {
    backgroundColor: '#F9F9F9',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1EFF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999999',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A90E2',
    marginLeft: 8,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});

export default NotificationScreen;