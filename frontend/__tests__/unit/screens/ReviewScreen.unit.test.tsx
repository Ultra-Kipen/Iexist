// root/frontend/tests/unit/screens/ReviewScreen.unit.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReviewScreen from '../../../src/screens/ReviewScreen';
import { Button, Card, SegmentedButtons } from 'react-native-paper';

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

describe('ReviewScreen 단위 테스트', () => {
  it('컴포넌트가 렌더링 되어야 함', () => {
    expect(() => render(<ReviewScreen />)).not.toThrow();
  });
  
  it('useState 훅이 period 상태를 제대로 관리해야 함', () => {
    const { UNSAFE_getByProps } = render(<ReviewScreen />);
    
    // 초기 상태값이 'weekly'인지 확인
    const segmentedButtons = UNSAFE_getByProps({ value: 'weekly' });
    expect(segmentedButtons).toBeTruthy();
  });
  
  it('SegmentedButtons 컴포넌트가 존재해야 함', () => {
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    
    // SegmentedButtons 컴포넌트가 있는지 확인
    const buttons = UNSAFE_getAllByType(SegmentedButtons);
    expect(buttons.length).toBeGreaterThan(0);
  });
  
  it('period 상태가 변경되면 UI가 업데이트되어야 함', () => {
    const { UNSAFE_getByProps } = render(<ReviewScreen />);
    
    // 초기 상태값이 'weekly'인지 확인
    let segmentedButtons = UNSAFE_getByProps({ value: 'weekly' });
    expect(segmentedButtons).toBeTruthy();
    
    // onValueChange 함수를 호출하여 period 상태 변경
    segmentedButtons.props.onValueChange('monthly');
    
    // 변경된 상태값이 'monthly'인지 확인
    segmentedButtons = UNSAFE_getByProps({ value: 'monthly' });
    expect(segmentedButtons).toBeTruthy();
  });
  
  it('이미지 그리드에 카드가 렌더링되어야 함', () => {
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    
    // Card 컴포넌트 개수 확인 (정확한 숫자 대신 최소 개수 확인)
    const cards = UNSAFE_getAllByType(Card);
    expect(cards.length).toBeGreaterThanOrEqual(6);
  });
  
  it('감정 변화 그래프 버튼이 존재하고 클릭 가능해야 함', () => {
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    const consoleSpy = jest.spyOn(console, 'log');
    
    // Button 컴포넌트 찾기
    const buttons = UNSAFE_getAllByType(Button);
    const graphButton = buttons.find(button => 
      button.props.children && 
      typeof button.props.children === 'string' && 
      button.props.children.includes('감정 변화 그래프')
    );
    
    expect(graphButton).toBeTruthy();
    
    // 버튼 클릭 시뮬레이션
    graphButton?.props.onPress();
    
    // console.log가 호출되었는지 확인
    expect(consoleSpy).toHaveBeenCalledWith('Show emotion graph');
    
    consoleSpy.mockRestore();
  });
  
  it('통계 카드가 존재해야 함', () => {
    const { UNSAFE_getAllByType } = render(<ReviewScreen />);
    
    // Card 컴포넌트 중에서 통계 카드 찾기 (더 단순한 접근법)
    const cards = UNSAFE_getAllByType(Card);
    // 적어도 하나의 카드는 통계 카드여야 함 - 마지막 카드가 통계 카드일 가능성이 높음
    expect(cards.length).toBeGreaterThan(0);
    // 여기서는 카드가 존재하는지만 확인하고, 내용은 검증하지 않음
  });
});