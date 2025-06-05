// tests/components/NotificationItem.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert, Text } from 'react-native';
import NotificationItem from '../../src/components/NotificationItem';

// 모듈 모킹 수정
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  return jest.fn(({ name }) => {
    return '<Icon name="' + name + '" />';
  });
});

jest.mock('../../src/contexts/NotificationContext', () => ({
  useNotification: () => ({
    markAsRead: jest.fn().mockResolvedValue(undefined),
    deleteNotification: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Alert.alert 모킹
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

describe('NotificationItem', () => {
  const mockNotification = {
    id: 1,
    user_id: 1,
    content: '새로운 댓글이 달렸습니다.',
    notification_type: 'comment' as const,
    related_id: 123,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders notification content correctly', () => {
    const { getByText } = render(
      <NotificationItem notification={mockNotification} onPress={mockOnPress} />
    );
    
    expect(getByText('새로운 댓글이 달렸습니다.')).toBeTruthy();
    expect(getByText('방금 전')).toBeTruthy();
  });

  it('displays different icon based on notification type', () => {
    const types = [
      { type: 'like' as const, expectedIcon: 'heart-outline' },
      { type: 'comment' as const, expectedIcon: 'comment-outline' },
      { type: 'challenge' as const, expectedIcon: 'trophy-outline' },
      { type: 'system' as const, expectedIcon: 'bell-outline' },
    ];
    
    types.forEach(({ type, expectedIcon }) => {
      const notification = { ...mockNotification, notification_type: type };
      const { UNSAFE_root } = render(
        <NotificationItem notification={notification} />
      );
      
      // @ts-ignore
      const iconElements = UNSAFE_root.findAll(node => 
        node.props && node.props.name === expectedIcon
      );
      
      expect(iconElements.length).toBeGreaterThan(0);
    });
  });
  it('formats relative time correctly', () => {
    // 5분 전 날짜 생성
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    const notification = {
      ...mockNotification,
      created_at: fiveMinutesAgo.toISOString(),
    };
    
    const { getByText } = render(<NotificationItem notification={notification} />);
    expect(getByText('5분 전')).toBeTruthy();
  });

  it('displays unread indicator for unread notifications', () => {
    const { getByTestId } = render(
      <NotificationItem notification={mockNotification} />
    );
    
    // View 컴포넌트에 testID를 추가해야 함
    expect(getByTestId('unread-indicator')).toBeTruthy();
  });

  it('does not display unread indicator for read notifications', () => {
    const readNotification = {
      ...mockNotification,
      is_read: true,
    };
    
    const { queryByTestId } = render(
      <NotificationItem notification={readNotification} />
    );
    
    expect(queryByTestId('unread-indicator')).toBeNull();
  });

// tests/components/NotificationItem.test.tsx - onPress 테스트 수정
it('calls onPress when notification is tapped', () => {
  const { getByTestId } = render(
    <NotificationItem 
      notification={mockNotification} 
      onPress={mockOnPress} 
    />
  );
  
  const notificationItem = getByTestId('notification-item');
  fireEvent.press(notificationItem);
  
  // 비동기 작업을 고려하여 수정
  expect(mockOnPress).toHaveBeenCalledTimes(1);
});

  it('shows alert when long pressed', () => {
    const { getByTestId } = render(
      <NotificationItem notification={mockNotification} />
    );
    
    fireEvent(getByTestId('notification-item'), 'onLongPress');
    
    expect(Alert.alert).toHaveBeenCalledWith(
      '알림 삭제',
      '이 알림을 삭제하시겠습니까?',
      expect.arrayContaining([
        expect.objectContaining({ text: '취소' }),
        expect.objectContaining({ text: '삭제' }),
      ])
    );
  });
});