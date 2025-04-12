// __tests__/mocks/contexts/NotificationContextMock.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Notification {
  id: number;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  receiveNotification: (notification: Notification) => void;
}

const defaultContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  receiveNotification: () => {}
};

const mockNotifications: Notification[] = [
  {
    id: 1,
    content: '새로운 댓글: "정말 좋은 글이네요!"',
    type: 'comment',
    isRead: false,
    createdAt: '2025-04-12T14:30:00Z',
    relatedId: 1
  },
  {
    id: 2,
    content: '새로운 좋아요를 받았습니다.',
    type: 'like',
    isRead: true,
    createdAt: '2025-04-12T13:15:00Z',
    relatedId: 2
  },
  {
    id: 3,
    content: '챌린지 "일주일 동안 행복한 순간 기록하기"가 시작되었습니다.',
    type: 'challenge',
    isRead: false,
    createdAt: '2025-04-11T09:00:00Z',
    relatedId: 1
  }
];

export const MockNotificationContext = createContext<NotificationContextType>(defaultContext);

export const useMockNotificationContext = () => useContext(MockNotificationContext);

export const MockNotificationProvider = ({ children, initialState }: { children: ReactNode, initialState?: Partial<NotificationContextType> }) => {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialState?.notifications || mockNotifications
  );
  const [isLoading, setIsLoading] = useState(initialState?.isLoading || false);
  const [error, setError] = useState<string | null>(initialState?.error || null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // 실제 API 호출 대신 목업 데이터 사용
      setNotifications(mockNotifications);
      setError(null);
    } catch (err) {
      setError('알림을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    setIsLoading(true);
    try {
      setNotifications(
        notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        )
      );
      setError(null);
    } catch (err) {
      setError('알림을 읽음 처리하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      setNotifications(
        notifications.map(n => ({ ...n, isRead: true }))
      );
      setError(null);
    } catch (err) {
      setError('모든 알림을 읽음 처리하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (id: number) => {
    setIsLoading(true);
    try {
      setNotifications(
        notifications.filter(n => n.id !== id)
      );
      setError(null);
    } catch (err) {
      setError('알림을 삭제하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const receiveNotification = (notification: Notification) => {
    setNotifications([notification, ...notifications]);
  };

  return (
    <MockNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        receiveNotification
      }}
    >
      {children}
    </MockNotificationContext.Provider>
  );
};