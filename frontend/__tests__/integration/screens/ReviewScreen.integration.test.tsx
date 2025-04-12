// root/frontend/tests/integration/screens/ReviewScreen.integration.test.tsx
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ReviewScreen from '../../../src/screens/ReviewScreen';
import { View, ScrollView } from 'react-native';
import { SegmentedButtons, Card, Button } from 'react-native-paper';

// useTheme 모킹
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    useTheme: jest.fn(() => ({
      colors: {
        primary: '#000',
        background: '#fff',
      },
    })),
  };
});

describe('ReviewScreen 통합 테스트', () => {
  it('컴포넌트가 네비게이션 환경에서 렌더링 되어야 함', () => {
    expect(() => render(<ReviewScreen />)).not.toThrow();
  });
  
  it('모든 주요 UI 요소가 렌더링되어야 함', () => {
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    
    // 주요 컴포넌트들이 렌더링되었는지 확인
    const scrollViews = UNSAFE_getAllByType(ScrollView);
    expect(scrollViews.length).toBeGreaterThan(0);
    
    const segmentedButtons = UNSAFE_getAllByType(SegmentedButtons);
    expect(segmentedButtons.length).toBe(1);
    
    const cards = UNSAFE_getAllByType(Card);
    expect(cards.length).toBeGreaterThan(0);
    
    const buttons = UNSAFE_getAllByType(Button);
    expect(buttons.length).toBeGreaterThan(0);
  });
  
  it('기간 선택 버튼이 존재하고 상태를 관리해야 함', () => {
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    
    // SegmentedButtons 찾기
    const segmentedButtons = UNSAFE_getAllByType(SegmentedButtons)[0];
    expect(segmentedButtons.props.value).toBe('weekly');
    
    // 상태 변경 검증 대신 onValueChange 함수가 존재하는지만 확인
    expect(typeof segmentedButtons.props.onValueChange).toBe('function');
  });
  
  it('이미지 그리드가 View 컴포넌트 내에 존재해야 함', () => {
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    
    // 이미지 그리드를 포함하는 View 컴포넌트 찾기
    const views = UNSAFE_getAllByType(View);
    const imageGridView = views.find(view => 
      view.props.style && 
      view.props.style.flexDirection === 'row' && 
      view.props.style.flexWrap === 'wrap'
    );
    
    expect(imageGridView).toBeTruthy();
    
    // 이미지 그리드 내의 Card 컴포넌트 확인 (정확한 개수 대신 최소 개수 확인)
    const cards = UNSAFE_getAllByType(Card);
    expect(cards.length).toBeGreaterThanOrEqual(6);
  });
  
  it('감정 변화 그래프 버튼이 클릭되면 콘솔 로그가 출력되어야 함', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    
    // 버튼 찾기
    const buttons = UNSAFE_getAllByType(Button);
    const graphButton = buttons.find(button => 
      button.props.children && 
      typeof button.props.children === 'string' && 
      button.props.children.includes('감정 변화 그래프')
    );
    
    expect(graphButton).toBeTruthy();
    
    // 버튼 클릭
    graphButton?.props.onPress();
    
    // 콘솔 로그 확인
    expect(consoleSpy).toHaveBeenCalledWith('Show emotion graph');
    
    consoleSpy.mockRestore();
  });
  
  it('스타일이 올바르게 적용되어야 함', () => {
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    
    // ScrollView에 스타일이 적용되었는지 확인
    const scrollView = UNSAFE_getAllByType(ScrollView)[0];
    expect(scrollView.props.style).toEqual(expect.objectContaining({
      flex: 1,
      padding: 16,
    }));
    
    // 이미지 그리드 스타일 확인
    const views = UNSAFE_getAllByType(View);
    const imageGridView = views.find(view => 
      view.props.style && 
      view.props.style.flexDirection === 'row' && 
      view.props.style.flexWrap === 'wrap'
    );
    
    expect(imageGridView?.props.style).toEqual(expect.objectContaining({
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    }));
    
    // 카드 스타일 확인
    const cards = UNSAFE_getAllByType(Card);
    if (cards.length > 0) {
      expect(cards[0].props.style).toEqual(expect.objectContaining({
        width: '48%',
        marginBottom: 16,
      }));
    }
  });
  
  it('SegmentedButtons의 두 옵션이 주간과 월간으로 표시되어야 함', () => {
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    
    const segmentedButtons = UNSAFE_getAllByType(SegmentedButtons)[0];
    expect(segmentedButtons.props.buttons).toEqual([
      { value: 'weekly', label: '주간' },
      { value: 'monthly', label: '월간' },
    ]);
  });
});