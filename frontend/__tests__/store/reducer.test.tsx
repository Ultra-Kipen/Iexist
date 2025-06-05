import { reducer, initialState } from '../../src/store/reducer';
import { ActionType, Notification } from '../../src/store/types';

describe('리듀서', () => {
  test('초기 상태가 올바르게 설정되어 있다', () => {
    expect(initialState).toEqual({
      isAuthenticated: false,
      user: null,
      notifications: [],
      theme: 'system',
      loading: false,
      error: null,
    });
  });
  
  test('SET_AUTHENTICATED 액션이 인증 상태를 업데이트한다', () => {
    const action = { type: ActionType.SET_AUTHENTICATED, payload: true };
    const newState = reducer(initialState, action);
    
    expect(newState.isAuthenticated).toBe(true);
    expect(newState).not.toBe(initialState); // 새로운 객체가 반환되었는지 확인
  });
  
  test('SET_USER 액션이 사용자 정보를 업데이트한다', () => {
    const user = { id: 1, username: 'test', email: 'test@example.com' };
    const action = { type: ActionType.SET_USER, payload: user };
    const newState = reducer(initialState, action);
    
    expect(newState.user).toEqual(user);
    expect(newState).not.toBe(initialState);
  });
  
  test('ADD_NOTIFICATION 액션이 알림을 추가한다', () => {
    const notification: Notification = {
      id: '1',
      content: 'Test notification',
      notificationType: 'system',
      isRead: false,
      createdAt: '2024-01-01T00:00:00Z'
    };
    const action = { type: ActionType.ADD_NOTIFICATION, payload: notification };
    const newState = reducer(initialState, action);
    
    expect(newState.notifications).toHaveLength(1);
    expect(newState.notifications[0]).toEqual(notification);
    expect(newState).not.toBe(initialState);
  });
  
  test('REMOVE_NOTIFICATION 액션이 알림을 제거한다', () => {
    const notification1: Notification = {
      id: '1',
      content: 'Test notification 1',
      notificationType: 'system',
      isRead: false,
      createdAt: '2024-01-01T00:00:00Z'
    };
    const notification2: Notification = {
      id: '2',
      content: 'Test notification 2',
      notificationType: 'like',
      isRead: false,
      createdAt: '2024-01-01T00:00:00Z'
    };
    
    const stateWithNotifications = {
      ...initialState,
      notifications: [notification1, notification2]
    };
    
    const action = { type: ActionType.REMOVE_NOTIFICATION, payload: '1' };
    const newState = reducer(stateWithNotifications, action);
    
    expect(newState.notifications).toHaveLength(1);
    expect(newState.notifications[0]).toEqual(notification2);
    expect(newState).not.toBe(stateWithNotifications);
  });
  
  test('CLEAR_NOTIFICATIONS 액션이 모든 알림을 제거한다', () => {
    const notification: Notification = {
      id: '1',
      content: 'Test notification',
      notificationType: 'system',
      isRead: false,
      createdAt: '2024-01-01T00:00:00Z'
    };
    
    const stateWithNotifications = {
      ...initialState,
      notifications: [notification]
    };
    
    const action = { type: ActionType.CLEAR_NOTIFICATIONS };
    const newState = reducer(stateWithNotifications, action);
    
    expect(newState.notifications).toHaveLength(0);
    expect(newState).not.toBe(stateWithNotifications);
  });
  
  test('SET_THEME 액션이 테마를 업데이트한다', () => {
    const action = { type: ActionType.SET_THEME, payload: 'dark' as const };
    const newState = reducer(initialState, action);
    
    expect(newState.theme).toBe('dark');
    expect(newState).not.toBe(initialState);
  });
  
  test('SET_LOADING 액션이 로딩 상태를 업데이트한다', () => {
    const action = { type: ActionType.SET_LOADING, payload: true };
    const newState = reducer(initialState, action);
    
    expect(newState.loading).toBe(true);
    expect(newState).not.toBe(initialState);
  });
  
  test('SET_ERROR 액션이 오류 메시지를 업데이트한다', () => {
    const action = { type: ActionType.SET_ERROR, payload: '오류 메시지' };
    const newState = reducer(initialState, action);
    
    expect(newState.error).toBe('오류 메시지');
    expect(newState).not.toBe(initialState);
  });
  
  test('CLEAR_ERROR 액션이 오류 메시지를 제거한다', () => {
    const stateWithError = {
      ...initialState,
      error: '오류 메시지'
    };
    
    const action = { type: ActionType.CLEAR_ERROR };
    const newState = reducer(stateWithError, action);
    
    expect(newState.error).toBeNull();
    expect(newState).not.toBe(stateWithError);
  });
  
  test('RESET_STATE 액션이 상태를 초기화한다', () => {
    const modifiedState = {
      isAuthenticated: true,
      user: { id: 1, username: 'test', email: 'test@example.com' },
      notifications: [
        {
          id: '1',
          content: 'Test notification',
          notificationType: 'system' as const,
          isRead: false,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ],
      theme: 'dark' as const,
      loading: true,
      error: '오류 메시지',
    };
    
    const action = { type: ActionType.RESET_STATE };
    const newState = reducer(modifiedState, action);
    
    expect(newState).toEqual(initialState);
    expect(newState).not.toBe(modifiedState);
  });
  
  test('알 수 없는 액션 타입이 원래 상태를 반환한다', () => {
    const action = { type: 'UNKNOWN_ACTION' as any };
    const newState = reducer(initialState, action);
    
    expect(newState).toBe(initialState);
  });
});