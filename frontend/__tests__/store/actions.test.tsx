import { actions } from '../../src/store/actions';
import { ActionType } from '../../src/store/types';

describe('액션 생성자 함수', () => {
  test('setAuthenticated 액션 생성자가 올바른 액션을 반환한다', () => {
    const action = actions.setAuthenticated(true);
    expect(action).toEqual({
      type: ActionType.SET_AUTHENTICATED,
      payload: true,
    });
  });
  
  test('setUser 액션 생성자가 올바른 액션을 반환한다', () => {
    const user = { id: 1, username: 'test', email: 'test@example.com' };
    const action = actions.setUser(user);
    expect(action).toEqual({
      type: ActionType.SET_USER,
      payload: user,
    });
  });
  
  test('addNotification 액션 생성자가 올바른 액션을 반환한다', () => {
    const notification = { 
      id: '1', 
      content: 'Test notification', 
      notificationType: 'system' as const,
      isRead: false,
      createdAt: '2024-01-01T00:00:00Z'
    };
    const action = actions.addNotification(notification);
    expect(action).toEqual({
      type: ActionType.ADD_NOTIFICATION,
      payload: notification,
    });
  });
  
  test('removeNotification 액션 생성자가 올바른 액션을 반환한다', () => {
    const action = actions.removeNotification('1');
    expect(action).toEqual({
      type: ActionType.REMOVE_NOTIFICATION,
      payload: '1',
    });
  });
  
  test('clearNotifications 액션 생성자가 올바른 액션을 반환한다', () => {
    const action = actions.clearNotifications();
    expect(action).toEqual({
      type: ActionType.CLEAR_NOTIFICATIONS,
    });
  });
  
  test('setTheme 액션 생성자가 올바른 액션을 반환한다', () => {
    const action = actions.setTheme('dark');
    expect(action).toEqual({
      type: ActionType.SET_THEME,
      payload: 'dark',
    });
  });
  
  test('setLoading 액션 생성자가 올바른 액션을 반환한다', () => {
    const action = actions.setLoading(true);
    expect(action).toEqual({
      type: ActionType.SET_LOADING,
      payload: true,
    });
  });
  
  test('setError 액션 생성자가 올바른 액션을 반환한다', () => {
    const action = actions.setError('오류 메시지');
    expect(action).toEqual({
      type: ActionType.SET_ERROR,
      payload: '오류 메시지',
    });
  });
  
  test('clearError 액션 생성자가 올바른 액션을 반환한다', () => {
    const action = actions.clearError();
    expect(action).toEqual({
      type: ActionType.CLEAR_ERROR,
    });
  });
  
  test('resetState 액션 생성자가 올바른 액션을 반환한다', () => {
    const action = actions.resetState();
    expect(action).toEqual({
      type: ActionType.RESET_STATE,
    });
  });
});