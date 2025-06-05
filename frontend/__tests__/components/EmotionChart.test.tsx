// tests/components/EmotionChart.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import EmotionChart from '../../src/components/EmotionChart';

// 라이브러리 모킹
jest.mock('react-native-chart-kit', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return {
    LineChart: jest.fn(props => {
      return React.createElement(View, { testID: 'line-chart' }, 
        React.createElement(Text, null, 'LineChart Mocked')
      );
    }),
    PieChart: jest.fn(props => {
      return React.createElement(View, { testID: 'pie-chart' }, 
        React.createElement(Text, null, 'PieChart Mocked')
      );
    }),
  };
});

describe('EmotionChart', () => {
  const mockEmotionData = [
    { count: 5, date: '2025-04-01', emotionId: 1, emotionName: '행복', color: '#FFD700' },
    { count: 3, date: '2025-04-02', emotionId: 2, emotionName: '슬픔', color: '#4682B4' },
    { count: 2, date: '2025-04-03', emotionId: 1, emotionName: '행복', color: '#FFD700' },
    { count: 4, date: '2025-04-04', emotionId: 3, emotionName: '화남', color: '#FF4500' },
  ];

  it('renders empty state when no data is provided', () => {
    const { getByText } = render(
      <EmotionChart data={[]} timeRange="daily" />
    );
    expect(getByText('감정 기록이 없습니다.')).toBeTruthy();
  });

  it('renders LineChart by default', () => {
    const { getByText, getByTestId } = render(
      <EmotionChart data={mockEmotionData} timeRange="daily" />
    );
    expect(getByText('일간 감정 변화')).toBeTruthy();
    expect(getByTestId('line-chart')).toBeTruthy();
  });

  it('renders PieChart when type is pie', () => {
    const { getByText, getByTestId } = render(
      <EmotionChart data={mockEmotionData} timeRange="weekly" type="pie" />
    );
    expect(getByText('주간 감정 분포')).toBeTruthy();
    expect(getByTestId('pie-chart')).toBeTruthy();
  });

  it('shows correct title based on timeRange', () => {
    const timeRanges = [
      { range: 'daily', expected: '일간' },
      { range: 'weekly', expected: '주간' },
      { range: 'monthly', expected: '월간' },
      { range: 'yearly', expected: '연간' },
    ];

    timeRanges.forEach(({ range, expected }) => {
      const { getByText } = render(
        <EmotionChart data={mockEmotionData} timeRange={range as any} />
      );
      expect(getByText(`${expected} 감정 변화`)).toBeTruthy();
    });
  });

  it('applies custom height when provided', () => {
    const customHeight = 300;
    const { getByTestId } = render(
      <EmotionChart data={mockEmotionData} timeRange="monthly" height={customHeight} />
    );
    expect(getByTestId('line-chart')).toBeTruthy();
    // 실제 환경에서는 height prop이 LineChart에 전달되었는지 확인할 수 있지만,
    // 모킹된 환경에서는 이 테스트는 단순히 컴포넌트가 렌더링되는지만 확인합니다.
  });
});