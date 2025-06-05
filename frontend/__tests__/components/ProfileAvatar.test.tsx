// __TESTS__/components/ProfileAvatar.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileAvatar from '../../src/components/ProfileAvatar';

describe('ProfileAvatar 컴포넌트', () => {
  it('이미지가 없을 때 이니셜이 표시되어야 합니다', () => {
    const { getByText } = render(
      <ProfileAvatar name="홍길동" />
    );
    
    expect(getByText('홍')).toBeTruthy();
  });

  it('이름이 없을 때 기본 이니셜이 표시되어야 합니다', () => {
    const { getByText } = render(
      <ProfileAvatar />
    );
    
    expect(getByText('?')).toBeTruthy();
  });

  it('isAnonymous가 true일 때 익명 이니셜이 표시되어야 합니다', () => {
    const { getByText } = render(
      <ProfileAvatar isAnonymous={true} name="홍길동" />
    );
    
    expect(getByText('익')).toBeTruthy();
  });

  it('showName이 true일 때 이름이 표시되어야 합니다', () => {
    const { getByText } = render(
      <ProfileAvatar name="홍길동" showName={true} />
    );
    
    expect(getByText('홍길동')).toBeTruthy();
  });

  it('isAnonymous가 true이고 showName이 true일 때 "익명"이 표시되어야 합니다', () => {
    const { getByText } = render(
      <ProfileAvatar isAnonymous={true} name="홍길동" showName={true} />
    );
    
    expect(getByText('익명')).toBeTruthy();
  });

  it('onPress 콜백이 제공되면 아바타를 클릭할 때 호출되어야 합니다', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ProfileAvatar name="홍길동" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('홍'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});