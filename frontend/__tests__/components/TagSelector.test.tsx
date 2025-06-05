// __TESTS__/components/TagSelector.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RenderAPI } from '@testing-library/react-native';
import TagSelector from '../../src/components/TagSelector';

const mockTags = [
  { id: 1, name: '일상' },
  { id: 2, name: '감정' },
  { id: 3, name: '고민' }
];

describe('TagSelector 컴포넌트', () => {
  it('태그 목록이 올바르게 렌더링되어야 합니다', () => {
    const { getByText } = render(
      <TagSelector
        tags={mockTags}
        selectedTags={[]}
        onTagSelect={jest.fn()}
      />
    );
    
    expect(getByText('일상')).toBeTruthy();
    expect(getByText('감정')).toBeTruthy();
    expect(getByText('고민')).toBeTruthy();
  });

  it('선택된 태그는 시각적으로 구분되어야 합니다', () => {
    const { getByText } = render(
      <TagSelector
        tags={mockTags}
        selectedTags={[1]}
        onTagSelect={jest.fn()}
      />
    );
    
    // 수정: 직접 태그 요소를 선택
    const selectedTag = getByText('일상');
    expect(selectedTag.props.style).toContainEqual({
      color: '#4A90E2',
      fontWeight: '500',
    });
  });

  it('태그를 클릭하면 onTagSelect 콜백이 호출되어야 합니다', () => {
    const mockOnTagSelect = jest.fn();
    const { getByText } = render(
      <TagSelector
        tags={mockTags}
        selectedTags={[]}
        onTagSelect={mockOnTagSelect}
      />
    );
    
    // 태그 텍스트 요소 직접 선택
    const tagTextElement = getByText('감정');
    fireEvent.press(tagTextElement);
    expect(mockOnTagSelect).toHaveBeenCalled();
  });

  it('allowCreation=true일 때 태그 생성 UI가 표시되어야 합니다', () => {
    const mockOnTagCreate = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <TagSelector
        tags={mockTags}
        selectedTags={[]}
        onTagSelect={jest.fn()}
        allowCreation={true}
        onTagCreate={mockOnTagCreate}
      />
    );
    
    // 입력 필드와 추가 버튼 확인
    expect(getByPlaceholderText('새 태그 입력')).toBeTruthy();
    expect(getByText('추가')).toBeTruthy();
  });

  it('maxSelected를 초과하는 태그를 선택하려 하면 disabled 상태가 되어야 합니다', () => {
    const { getByText } = render(
      <TagSelector
        tags={mockTags}
        selectedTags={[1, 2]}
        onTagSelect={jest.fn()}
        maxSelected={2}
      />
    );
    
    // 마지막 태그 텍스트 선택 - 비활성화 상태인지 확인
    const disabledTagText = getByText('고민');
    expect(disabledTagText.props.style).toContainEqual({
      color: '#999999',
    });
  });
});