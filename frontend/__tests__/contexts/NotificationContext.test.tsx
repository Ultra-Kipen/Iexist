// __tests__/contexts/NotificationContext.test.tsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NotificationProvider, useNotification } from '../../src/contexts/NotificationContext';
import notificationService from '../../src/services/api/notificationService';

// 모의 알림 서비스
jest.mock('../../src/services/api/notificationService', () => ({
  getNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
}));

// 테스트 컴포넌트
const TestComponent = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification();

  const { View, Text, TouchableOpacity } = require('react-native');

  return (
    <View>
      <Text testID="loading">{isLoading ? 'loading' : 'not-loading'}</Text>
      <Text testID="error">{error || 'no-error'}</Text>
      <Text testID="unread-count">{unreadCount.toString()}</Text>
      <Text testID="notifications-count">{notifications.length.toString()}</Text>
      <TouchableOpacity testID="mark-read" onPress={() => markAsRead(1)}>
        <Text>Mark Read</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="mark-all-read" onPress={() => markAllAsRead()}>
        <Text>Mark All Read</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="delete-notification" onPress={() => deleteNotification(1)}>
        <Text>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('NotificationContext', () => {
  const mockNotifications = [
    {
      id: 1,
      user_id: 1,
      content: 'Test notification 1',
      notification_type: 'like' as const,
      is_read: false,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      user_id: 1,
      content: 'Test notification 2',
      notification_type: 'comment' as const,
      is_read: true,
      created_at: '2024-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // API 응답 모킹 - 직접 Promise 사용
    (notificationService.getNotifications as jest.Mock).mockResolvedValue({
      data: mockNotifications
    });
    
    (notificationService.markAsRead as jest.Mock).mockResolvedValue({
      success: true
    });
    
    (notificationService.markAllAsRead as jest.Mock).mockResolvedValue({
      success: true
    });
    
    (notificationService.deleteNotification as jest.Mock).mockResolvedValue({
      success: true
    });

    // setInterval 모킹 (Jest timer 사용 대신 직접 모킹)
    global.setInterval = jest.fn().mockReturnValue(123);
    global.clearInterval = jest.fn();
  });

  // 기본 렌더링 테스트
  it('renders without crashing', () => {
    const { Text } = require('react-native');
    render(
      <NotificationProvider>
        <Text>Test</Text>
      </NotificationProvider>
    );
    // 성공적으로 렌더링되었다면 성공
    expect(true).toBe(true);
  });

  // 초기 상태 테스트
  it('initializes with correct data', async () => {
    const { getByTestId } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // fetchNotifications가 호출될 때까지 대기
    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalled();
    });
    
    // Promise가 해결된 후에도 상태 업데이트를 위한 시간 필요
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 업데이트된 상태 확인
    await waitFor(() => {
      expect(getByTestId('notifications-count').props.children).toBe('2');
      expect(getByTestId('unread-count').props.children).toBe('1');
    });
  });

  // 모든 알림 읽음 처리 테스트
  it('can mark all notifications as read', async () => {
    const { getByTestId } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // 초기 데이터 로딩 대기
    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalled();
    });
    
    // 상태 업데이트 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 버튼 클릭
    await act(async () => {
      fireEvent.press(getByTestId('mark-all-read'));
    });
    
    // API 호출 확인
    await waitFor(() => {
      expect(notificationService.markAllAsRead).toHaveBeenCalled();
    });
    
    // 상태 업데이트를 위한 시간
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 알림 목록 새로고침 확인
    expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
  });

  // 알림 삭제 테스트
  it('can delete a notification', async () => {
    const { getByTestId } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // 초기 데이터 로딩 대기
    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalled();
    });
    
    // 상태 업데이트 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 버튼 클릭
    await act(async () => {
      fireEvent.press(getByTestId('delete-notification'));
    });
    
    // API 호출 확인
    await waitFor(() => {
      expect(notificationService.deleteNotification).toHaveBeenCalledWith(1);
    });
    
    // 알림 목록 새로고침 확인
    expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
  });

  // 에러 핸들링 테스트 수정
  it('handles errors when fetching notifications', async () => {
    // 에러 응답으로 모킹 변경
    (notificationService.getNotifications as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch notifications')
    );
    
    const { getByTestId } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // 에러가 발생하고 상태가 업데이트될 때까지 대기
    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalled();
    });
    
    // 상태 업데이트 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 에러 상태 확인
    await waitFor(() => {
      expect(getByTestId('error').props.children).toBe('알림을 불러오는데 실패했습니다.');
    });
  });

  // 로딩 상태 테스트 수정
  it('shows loading state', async () => {
    // 비동기 작업이 진행 중일 때는 loading 상태
    let resolvePromise: (value: any) => void;
    (notificationService.getNotifications as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );
    
    const { getByTestId } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // 초기 로딩 상태 확인
    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('loading');
    });
    
    // 응답 완료 시뮬레이션
    await act(async () => {
      resolvePromise!({ data: mockNotifications });
      // 상태 업데이트를 위한 시간
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 로딩 상태 해제 확인
    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('not-loading');
    });
  });
});