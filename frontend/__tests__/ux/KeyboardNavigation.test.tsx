import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, TextInput, Button, Text } from 'react-native';

// 키보드 내비게이션을 테스트하기 위한 샘플 폼 컴포넌트
const KeyboardNavigableForm = () => {
  const [values, setValues] = React.useState({
    name: '',
    email: '',
    message: '',
  });
  const [focusedField, setFocusedField] = React.useState<string | null>(null);

  const handleSubmit = () => {
    console.log('폼 제출됨:', values);
  };

  return (
    <View>
      <Text>접근성 테스트 폼</Text>
      <TextInput
        value={values.name}
        onChangeText={(text) => setValues({ ...values, name: text })}
        placeholder="이름"
        returnKeyType="next"
        onFocus={() => setFocusedField('name')}
        onSubmitEditing={() => setFocusedField('email')}
        blurOnSubmit={false}
        accessibilityLabel="이름 입력"
        testID="name-input"
      />

      <TextInput
        value={values.email}
        onChangeText={(text) => setValues({ ...values, email: text })}
        placeholder="이메일"
        returnKeyType="next"
        onFocus={() => setFocusedField('email')}
        onSubmitEditing={() => setFocusedField('message')}
        blurOnSubmit={false}
        accessibilityLabel="이메일 입력"
        testID="email-input"
      />

      <TextInput
        value={values.message}
        onChangeText={(text) => setValues({ ...values, message: text })}
        placeholder="메시지"
        returnKeyType="done"
        onFocus={() => setFocusedField('message')}
        onSubmitEditing={() => setFocusedField('submit')}
        accessibilityLabel="메시지 입력"
        testID="message-input"
      />

      <Button
        title="제출"
        onPress={handleSubmit}
        accessibilityLabel="폼 제출 버튼"
        testID="submit-button"
      />
      
      {/* 디버깅용: 현재 포커스된 필드 표시 */}
      <Text testID="focused-field">현재 포커스: {focusedField || '없음'}</Text>
    </View>
  );
};

describe('키보드 내비게이션 테스트', () => {
  test('키보드 리턴 키를 사용하여 다음 필드로 이동할 수 있어야 함', () => {
    const { getByTestId } = render(<KeyboardNavigableForm />);
    
    const nameInput = getByTestId('name-input');
    
    // 첫 번째 입력 필드에 포커스
    fireEvent(nameInput, 'focus');
    expect(getByTestId('focused-field').props.children).toEqual(['현재 포커스: ', 'name']);
    
    // 리턴 키를 눌러 다음 필드로 이동
    fireEvent(nameInput, 'submitEditing');
    expect(getByTestId('focused-field').props.children).toEqual(['현재 포커스: ', 'email']);
    
    // 이메일 필드에서 리턴 키를 눌러 메시지 필드로 이동
    const emailInput = getByTestId('email-input');
    fireEvent(emailInput, 'submitEditing');
    expect(getByTestId('focused-field').props.children).toEqual(['현재 포커스: ', 'message']);
  });

  test('모든 상호작용 요소에 접근성 레이블이 있어야 함', () => {
    const { getByLabelText } = render(<KeyboardNavigableForm />);
    
    expect(getByLabelText('이름 입력')).toBeTruthy();
    expect(getByLabelText('이메일 입력')).toBeTruthy();
    expect(getByLabelText('메시지 입력')).toBeTruthy();
    expect(getByLabelText('폼 제출 버튼')).toBeTruthy();
  });
});