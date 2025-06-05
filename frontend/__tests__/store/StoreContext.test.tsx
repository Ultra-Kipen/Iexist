import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View, TouchableOpacity } from 'react-native';
import { StoreProvider, useStore } from '../../src/store/StoreContext';
import { initialState } from '../../src/store/reducer';
import { ActionType } from '../../src/store/types';

// 테스트용 컴포넌트 - React Native 컴포넌트 사용
const TestComponent = () => {
  const { state, dispatch } = useStore();
  
  return (
    <View>
      <Text testID="auth-status">{state.isAuthenticated ? 'authenticated' : 'not-authenticated'}</Text>
      <TouchableOpacity 
        onPress={() => dispatch({ 
          type: ActionType.SET_AUTHENTICATED, 
          payload: !state.isAuthenticated 
        })}
        testID="toggle-auth"
      >
        <Text>Toggle Auth</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('StoreContext', () => {
  test('StoreProvider는 상태와 디스패치 함수를 제공한다', () => {
    const { getByTestId } = render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );
    
    // 초기 상태 확인
    expect(getByTestId('auth-status').props.children).toBe('not-authenticated');
    
    // 디스패치 함수가 작동하는지 확인
    fireEvent.press(getByTestId('toggle-auth'));
    expect(getByTestId('auth-status').props.children).toBe('authenticated');
  });
  
  test('초기 상태가 올바르게 설정된다', () => {
    // 테스트용 컴포넌트 - React Native 컴포넌트 사용
    const StateCheckComponent = () => {
      const { state } = useStore();
      return (
        <View>
          <Text testID="is-authenticated">{String(state.isAuthenticated)}</Text>
          <Text testID="user">{state.user === null ? 'null' : 'user'}</Text>
          {/* 숫자를 문자열로 명시적 변환 */}
          <Text testID="notifications-count">{String(state.notifications.length)}</Text>
          <Text testID="theme">{state.theme}</Text>
          <Text testID="loading">{String(state.loading)}</Text>
          <Text testID="error">{state.error === null ? 'null' : state.error}</Text>
        </View>
      );
    };
    
    const { getByTestId } = render(
      <StoreProvider>
        <StateCheckComponent />
      </StoreProvider>
    );
    
    // 초기 상태 확인 - React Native에서는 textContent 대신 props.children 사용
    expect(getByTestId('is-authenticated').props.children).toBe(String(initialState.isAuthenticated));
    expect(getByTestId('user').props.children).toBe('null');
    expect(getByTestId('notifications-count').props.children).toBe('0');
    expect(getByTestId('theme').props.children).toBe(initialState.theme);
    expect(getByTestId('loading').props.children).toBe(String(initialState.loading));
    expect(getByTestId('error').props.children).toBe('null');
  });
});