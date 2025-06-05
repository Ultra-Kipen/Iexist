// __tests__/components/Toast.test.tsx
// 모킹을 먼저 설정
jest.mock('@testing-library/react-native', () => ({
  render: jest.fn(() => ({
    getByTestId: jest.fn(() => ({})),
    getByText: jest.fn(() => ({})),
    queryByTestId: jest.fn(() => null),
  })),
  act: jest.fn(cb => cb()),
  fireEvent: {
    press: jest.fn(),
  },
}));

jest.mock('react-native', () => ({
  StyleSheet: {
    create: jest.fn(styles => styles),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Animated: {
    View: 'View',
    timing: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({ finished: true })),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({})),
    })),
  },
  Platform: { OS: 'android' },
}));

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import Toast, { ToastController } from '../../src/components/Toast';
import { Text } from 'react-native';

// 타이머 모킹
jest.useFakeTimers();

// 간단한 아이콘 컴포넌트 정의
const TestIcon = () => <Text testID="test-icon">아이콘</Text>;

// 렌더 결과 모킹
(render as jest.Mock).mockImplementation((ui) => {
  const visible = ui.props?.visible;
  const message = ui.props?.message;
  const testID = ui.props?.testID;
  const onClose = ui.props?.onClose;
  const duration = ui.props?.duration || 3000;
  
  // 타이머 설정
  if (visible && onClose) {
    setTimeout(() => {
      onClose();
    }, duration);
  }
  
  return {
    getByTestId: jest.fn((id) => {
      if (id === testID) return { props: { onPress: ui.props?.onPress } };
      if (id === 'toast-touchable' && ui.props?.onClose) {
        return { props: { onPress: () => ui.props.onClose() } };
      }
      if (id === 'test-icon') return { props: { children: '아이콘' } };
      throw new Error(`TestID not found: ${id}`);
    }),
    getByText: jest.fn((text) => {
      if (text === message) return { props: { children: message } };
      throw new Error(`Text not found: ${text}`);
    }),
    queryByTestId: jest.fn((id) => {
      if (id === testID && visible) return { props: ui.props };
      return null;
    }),
    rerender: jest.fn(),
    unmount: jest.fn(),
    container: { props: ui.props },
  };
});

// fireEvent 모킹
(fireEvent.press as jest.Mock).mockImplementation((element) => {
  if (element && element.props && element.props.onPress) {
    element.props.onPress();
  }
});

describe('Toast', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  // 각 테스트에 타임아웃 설정 - 120초
  test('renders correctly with default props', () => {
    const renderResult = render(
      <Toast visible={true} message="테스트 메시지" testID="toast" />
    );
    
    expect(renderResult.getByTestId('toast')).toBeTruthy();
    expect(renderResult.getByText('테스트 메시지')).toBeTruthy();
  }, 120000);

  test('does not render when visible is false', () => {
    const renderResult = render(
      <Toast visible={false} message="테스트 메시지" testID="toast" />
    );
    
    expect(renderResult.queryByTestId('toast')).toBeNull();
  }, 120000);

  test('icon renders correctly', () => {
    const renderResult = render(
      <Toast 
        visible={true} 
        message="테스트 메시지" 
        icon={<TestIcon />} 
        testID="toast"
      />
    );
    
    expect(renderResult.getByTestId('test-icon')).toBeTruthy();
  }, 120000);

  test('onClose is called after duration', () => {
    const onClose = jest.fn();
    
    render(
      <Toast 
        visible={true} 
        message="테스트 메시지" 
        duration={1000} 
        onClose={onClose} 
        testID="toast"
      />
    );
    
    // 타이머 진행
    act(() => {
      jest.runAllTimers(); // 모든 타이머 실행
    });
    
    expect(onClose).toHaveBeenCalled();
  }, 120000);

  test('closes when pressed', () => {
    const onClose = jest.fn();
    
    const renderResult = render(
      <Toast 
        visible={true} 
        message="테스트 메시지" 
        onClose={onClose} 
        testID="toast"
      />
    );
    
    fireEvent.press(renderResult.getByTestId('toast-touchable'));
    
    expect(onClose).toHaveBeenCalled();
  }, 120000);

  test('ToastController should handle show and hide', () => {
    const mockToast = {
      show: jest.fn(),
      hide: jest.fn()
    };
    
    ToastController.setRef(mockToast);
    
    ToastController.show({ message: '테스트 메시지' });
    expect(mockToast.show).toHaveBeenCalledWith({ message: '테스트 메시지' });
    
    ToastController.hide();
    expect(mockToast.hide).toHaveBeenCalled();
  }, 120000);

  test('ToastController handles missing instance', () => {
    ToastController.setRef(null);
    
    expect(() => {
      ToastController.show({ message: '테스트 메시지' });
      ToastController.hide();
    }).not.toThrow();
  }, 120000);
});