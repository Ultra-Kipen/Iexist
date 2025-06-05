import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View, Button, TextInput, TouchableOpacity } from 'react-native';

// 접근성 테스트용 샘플 컴포넌트
const AccessibleComponent = () => (
  <View accessible={true} accessibilityLabel="메인 컨테이너">
    <Text accessibilityLabel="제목" accessibilityRole="header">
      접근성 테스트
    </Text>
    
    <TouchableOpacity
      accessible={true}
      accessibilityLabel="정보 버튼"
      accessibilityHint="추가 정보를 표시합니다"
      accessibilityRole="button"
    >
      <Text>정보</Text>
    </TouchableOpacity>
    
    <Button
      title="저장"
      accessibilityLabel="저장 버튼"
      accessibilityHint="양식을 저장합니다"
    />
    
    <TextInput
      placeholder="이름을 입력하세요"
      accessibilityLabel="이름 입력 필드"
    />
  </View>
);

// 접근성이 부족한 컴포넌트
const InaccessibleComponent = () => (
  <View>
    <Text>접근성 테스트</Text>
    <TouchableOpacity>
      <Text>정보</Text>
    </TouchableOpacity>
    <Button title="저장" />
    <TextInput placeholder="이름을 입력하세요" />
  </View>
);

describe('접근성 테스트', () => {
  test('AccessibleComponent가 적절한 접근성 속성을 가져야 함', () => {
    const { getByLabelText } = render(<AccessibleComponent />);
    
    // 접근성 레이블로 요소 찾기
    expect(getByLabelText('메인 컨테이너')).toBeTruthy();
    expect(getByLabelText('제목')).toBeTruthy();
    expect(getByLabelText('정보 버튼')).toBeTruthy();
    expect(getByLabelText('저장 버튼')).toBeTruthy();
    expect(getByLabelText('이름 입력 필드')).toBeTruthy();
  });

  test('InaccessibleComponent에 접근성 속성이 부족함', () => {
    const { queryByLabelText } = render(<InaccessibleComponent />);
    
    // 접근성 레이블이 없으므로 이런 쿼리들은 없어야 함
    expect(queryByLabelText('메인 컨테이너')).toBeNull();
    expect(queryByLabelText('제목')).toBeNull();
    expect(queryByLabelText('정보 버튼')).toBeNull();
    expect(queryByLabelText('저장 버튼')).toBeNull();
    expect(queryByLabelText('이름 입력 필드')).toBeNull();
  });

  test('대화형 요소에 접근성 힌트가 있어야 함', () => {
    const { getByLabelText } = render(<AccessibleComponent />);
    
    const infoButton = getByLabelText('정보 버튼');
    const saveButton = getByLabelText('저장 버튼');
    
    // 접근성 힌트 확인 (속성 존재 확인)
    expect(infoButton.props.accessibilityHint).toBe('추가 정보를 표시합니다');
    expect(saveButton.props.accessibilityHint).toBe('양식을 저장합니다');
  });

  test('접근성 역할이 올바르게 설정되어야 함', () => {
    const { getByLabelText } = render(<AccessibleComponent />);
    
    // 역할 확인 (header, button 등)
    const title = getByLabelText('제목');
    const infoButton = getByLabelText('정보 버튼');
    
    expect(title.props.accessibilityRole).toBe('header');
    expect(infoButton.props.accessibilityRole).toBe('button');
  });
});