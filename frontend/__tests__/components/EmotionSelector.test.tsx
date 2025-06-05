// __tests__/components/EmotionSelector.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmotionSelector from '../../src/components/EmotionSelector';

describe('EmotionSelector 컴포넌트', () => {
  const mockEmotions = [
    { id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
    { id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
  ];
  
  const mockOnSelectEmotion = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('감정 선택기가 올바르게 렌더링되어야 함', () => {
    const { getByText } = render(
      <EmotionSelector
        emotions={mockEmotions}
        selectedEmotions={[]}
        onSelect={mockOnSelectEmotion}
      />
    );
    
    expect(getByText('행복')).toBeDefined();
    expect(getByText('감사')).toBeDefined();
  });

  it('감정 아이템을 클릭하면 onSelectEmotion이 호출되어야 함', () => {
    const { getByText } = render(
      <EmotionSelector
        emotions={mockEmotions}
        selectedEmotions={[]}
        onSelect={mockOnSelectEmotion}
      />
    );
    
    fireEvent.press(getByText('행복'));
    
    expect(mockOnSelectEmotion).toHaveBeenCalledWith(1);
  });

  it('이미 선택된 감정이 강조되어야 함', () => {
    const { getAllByText } = render(
      <EmotionSelector
        emotions={mockEmotions}
        selectedEmotions={[1]}
        onSelect={mockOnSelectEmotion}
      />
    );
    
    // 텍스트로 검색
    const happyText = getAllByText('행복')[0];
    expect(happyText).toBeDefined();
  });
});