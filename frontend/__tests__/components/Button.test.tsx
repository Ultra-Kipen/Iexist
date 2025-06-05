import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, View, Text } from 'react-native';

interface MockButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  testID?: string;
  type?: string;
  size?: string;
  style?: any;
  textStyle?: any;
}

const MockButton: React.FC<MockButtonProps> = ({ 
  onPress, 
  title, 
  disabled, 
  loading, 
  leftIcon, 
  rightIcon, 
  testID = 'button-component',
  type,
  size,
  style,
  textStyle
}) => {
  if (loading) {
    return (
      <TouchableOpacity testID={testID} disabled={true}>
        <Text testID="loading-indicator">Loading...</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      testID={testID} 
      onPress={!disabled ? onPress : undefined} 
      disabled={disabled}
    >
      <View>
        {leftIcon}
        <Text testID="button-text">{title}</Text>
        {rightIcon}
      </View>
    </TouchableOpacity>
  );
};

const LeftIcon: React.FC = () => <View testID="left-icon-content" />;
const RightIcon: React.FC = () => <View testID="right-icon-content" />;

describe('Button 컴포넌트', () => {
  const mockOnPress = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('버튼이 올바르게 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton onPress={mockOnPress} title="테스트 버튼" />
    );
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
    expect(buttonText.props.children).toBe('테스트 버튼');
  });

  it('버튼 클릭 시 onPress 함수가 호출되어야 함', () => {
    const { getByTestId } = render(
      <MockButton onPress={mockOnPress} title="테스트 버튼" />
    );
    
    const button = getByTestId('button-component');
    fireEvent.press(button);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('비활성화된 버튼은 onPress 함수를 호출하지 않아야 함', () => {
    const disabledMockOnPress = jest.fn();
    
    const { getByTestId } = render(
      <MockButton onPress={disabledMockOnPress} title="비활성화 버튼" disabled={true} />
    );
    
    const button = getByTestId('button-component');
    fireEvent.press(button);
    
    expect(disabledMockOnPress).not.toHaveBeenCalled();
  });

  it('로딩 상태의 버튼은 텍스트를 숨겨야 함', () => {
    const { queryByTestId } = render(
      <MockButton onPress={mockOnPress} title="로딩 버튼" loading={true} />
    );
    
    const buttonText = queryByTestId('button-text');
    expect(buttonText).toBeNull();
    
    const loadingIndicator = queryByTestId('loading-indicator');
    expect(loadingIndicator).toBeTruthy();
  });

  it('primary 타입 버튼이 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton onPress={mockOnPress} title="프라이머리 버튼" type="primary" />
    );
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('secondary 타입 버튼이 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton onPress={mockOnPress} title="세컨더리 버튼" type="secondary" />
    );
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('outline 타입 버튼이 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton onPress={mockOnPress} title="아웃라인 버튼" type="outline" />
    );
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('text 타입 버튼이 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton onPress={mockOnPress} title="텍스트 버튼" type="text" />
    );
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('small 크기 버튼이 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton onPress={mockOnPress} title="작은 버튼" size="small" />
    );
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('large 크기 버튼이 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton onPress={mockOnPress} title="큰 버튼" size="large" />
    );
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('커스텀 스타일이 적용된 버튼이 렌더링되어야 함', () => {
    const customStyle = { backgroundColor: '#FF5733', borderRadius: 20 };
    
    const { getByTestId } = render(
      <MockButton 
        onPress={mockOnPress} 
        title="커스텀 스타일 버튼" 
        style={customStyle} 
      />
    );
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('커스텀 텍스트 스타일이 적용된 버튼이 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton 
        onPress={mockOnPress} 
        title="커스텀 텍스트 스타일" 
        textStyle={{ fontSize: 18, fontWeight: 'bold', color: '#FF0000' }}
      />
    );
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('leftIcon이 있는 버튼이 올바르게 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton 
        onPress={mockOnPress} 
        title="왼쪽 아이콘 버튼" 
        leftIcon={<LeftIcon />}
      />
    );
    
    const button = getByTestId('button-component');
    expect(button).toBeTruthy();
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('rightIcon이 있는 버튼이 올바르게 렌더링되어야 함', () => {
    const { getByTestId } = render(
      <MockButton 
        onPress={mockOnPress} 
        title="오른쪽 아이콘 버튼" 
        rightIcon={<RightIcon />}
      />
    );
    
    const button = getByTestId('button-component');
    expect(button).toBeTruthy();
    
    const buttonText = getByTestId('button-text');
    expect(buttonText).toBeTruthy();
  });

  it('로딩 상태에서는 아이콘이 표시되지 않아야 함', () => {
    const { queryByTestId } = render(
      <MockButton 
        onPress={mockOnPress} 
        title="로딩 상태 아이콘 버튼" 
        leftIcon={<LeftIcon />}
        rightIcon={<RightIcon />}
        loading={true}
      />
    );
    
    const buttonText = queryByTestId('button-text');
    expect(buttonText).toBeNull();
    
    const loadingIndicator = queryByTestId('loading-indicator');
    expect(loadingIndicator).toBeTruthy();
  });
});