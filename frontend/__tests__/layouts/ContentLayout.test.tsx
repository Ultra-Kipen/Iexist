// tests/layouts/ContentLayout.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ContentLayout from '../../src/layouts/ContentLayout';

// useTheme 모킹
jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#ffffff',
        primary: '#6200ee',
      },
    },
  }),
}));

// LoadingIndicator 모킹
jest.mock('../../src/components/LoadingIndicator', () => {
  const React = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(ReactNative.View, { testID: 'loading-indicator' }),
  };
});

describe('ContentLayout', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ContentLayout>
        <Text>Test Content</Text>
      </ContentLayout>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });
  
  it('shows loading indicator when loading is true', () => {
    const { getByTestId, queryByText } = render(
      <ContentLayout loading={true}>
        <Text>Test Content</Text>
      </ContentLayout>
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(queryByText('Test Content')).toBeNull();
  });
  
  it('renders header and footer when provided', () => {
    const { getByText } = render(
      <ContentLayout
        header={<Text>Header</Text>}
        footer={<Text>Footer</Text>}
      >
        <Text>Test Content</Text>
      </ContentLayout>
    );
    
    expect(getByText('Header')).toBeTruthy();
    expect(getByText('Footer')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
  });
  
  it('renders as View when scrollEnabled is false', () => {
    const { getByText } = render(
      <ContentLayout scrollEnabled={false}>
        <Text>Test Content</Text>
      </ContentLayout>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });
  
  it('handles onRefresh callback when provided', () => {
    const onRefreshMock = jest.fn();
    const { getByText } = render(
      <ContentLayout onRefresh={onRefreshMock}>
        <Text>Test Content</Text>
      </ContentLayout>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
    expect(onRefreshMock).not.toHaveBeenCalled();
  });
  
  it('applies padded style when padded is true', () => {
    const { getByText } = render(
      <ContentLayout padded={true}>
        <Text>Test Content</Text>
      </ContentLayout>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });
});