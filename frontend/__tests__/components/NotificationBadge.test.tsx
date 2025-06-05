// __TESTS__/components/NotificationBadge.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import NotificationBadge from '../../src/components/NotificationBadge';
import { useNotification } from '../../src/contexts/NotificationContext';

// react-native 모킹
jest.mock('react-native', () => {
  const React = require('react');
  
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
      compose: (style1: any, style2: any) => [style1, style2],
    },
    View: React.forwardRef(({ children, style, testID, ...props }: any, ref: any) => 
      React.createElement('View', { 'data-testid': testID, ...props, ref }, children)
    ),
    Text: React.forwardRef(({ children, style, testID, ...props }: any, ref: any) => 
      React.createElement('Text', { 'data-testid': testID, ...props, ref }, children)
    ),
    Dimensions: {
      get: () => ({ width: 375, height: 667 }),
    },
  };
}, { virtual: true });
// NotificationContext 모의(Mock)
jest.mock('../../src/contexts/NotificationContext', () => ({
  useNotification: jest.fn()
}));

describe('NotificationBadge 컴포넌트', () => {
  beforeEach(() => {
    // 기본 모의 설정
    (useNotification as jest.Mock).mockReturnValue({
      unreadCount: 0
    });
  });

  it('unreadCount가 0이고 showZero가 false이면 배지가 표시되지 않아야 합니다', () => {
    (useNotification as jest.Mock).mockReturnValue({
      unreadCount: 0
    });
    
    const { queryByText } = render(
      <NotificationBadge showZero={false} />
    );
    
    expect(queryByText('0')).toBeNull();
  });

  it('unreadCount가 0이지만 showZero가 true이면 배지가 표시되어야 합니다', () => {
    (useNotification as jest.Mock).mockReturnValue({
      unreadCount: 0
    });
    
    const { getByText } = render(
      <NotificationBadge showZero={true} />
    );
    
    expect(getByText('0')).toBeTruthy();
  });

  it('unreadCount가 있으면 배지에 카운트가 표시되어야 합니다', () => {
    (useNotification as jest.Mock).mockReturnValue({
      unreadCount: 5
    });
    
    const { getByText } = render(
      <NotificationBadge />
    );
    
    expect(getByText('5')).toBeTruthy();
  });

  it('maxCount보다 큰 unreadCount는 maxCount+로 표시되어야 합니다', () => {
    (useNotification as jest.Mock).mockReturnValue({
      unreadCount: 120
    });
    
    const { getByText } = render(
      <NotificationBadge maxCount={99} />
    );
    
    expect(getByText('99+')).toBeTruthy();
  });
});