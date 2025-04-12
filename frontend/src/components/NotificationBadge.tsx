import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNotification } from '../contexts/NotificationContext';

interface NotificationBadgeProps {
  style?: object;
  showZero?: boolean;
  maxCount?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  style,
  showZero = false,
  maxCount = 99
}) => {
  const { unreadCount } = useNotification();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  
  // 카운트가 변경될 때 애니메이션 효과
  useEffect(() => {
    if (unreadCount > 0 || showZero) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [unreadCount, showZero, scaleAnim]);
  
  // 표시할 카운트 계산 (maxCount 초과 시 "+")
  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();
  
  // 카운트가 0이고 showZero가 false이면 렌더링하지 않음
  if (unreadCount === 0 && !showZero) {
    return null;
  }
  
  return (
    <Animated.View 
      style={[
        styles.badge,
        style,
        { transform: [{ scale: scaleAnim }] },
        unreadCount > 9 && styles.wideBadge,
        unreadCount > 99 && styles.extraWideBadge
      ]}
    >
      <Text style={styles.count}>{displayCount}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  wideBadge: {
    minWidth: 22,
    borderRadius: 11
  },
  extraWideBadge: {
    minWidth: 28
  },
  count: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default NotificationBadge;