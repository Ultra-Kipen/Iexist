// src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    // 타입별 스타일
    switch (type) {
      case 'primary':
        buttonStyle = styles.primaryButton;
        break;
      case 'secondary':
        buttonStyle = styles.secondaryButton;
        break;
      case 'outline':
        buttonStyle = styles.outlineButton;
        break;
      case 'text':
        buttonStyle = styles.textButton;
        break;
    }
    
    // 크기별 스타일
    switch (size) {
      case 'small':
        buttonStyle = { ...buttonStyle, ...styles.smallButton };
        break;
      case 'medium':
        buttonStyle = { ...buttonStyle, ...styles.mediumButton };
        break;
      case 'large':
        buttonStyle = { ...buttonStyle, ...styles.largeButton };
        break;
    }
    
    // 비활성화 상태
    if (disabled) {
      buttonStyle = { ...buttonStyle, ...styles.disabledButton };
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyleObj: TextStyle = {};
    
    switch (type) {
      case 'primary':
        textStyleObj = styles.primaryText;
        break;
      case 'secondary':
        textStyleObj = styles.secondaryText;
        break;
      case 'outline':
        textStyleObj = styles.outlineText;
        break;
      case 'text':
        textStyleObj = styles.textOnlyText;
        break;
    }
    
    switch (size) {
      case 'small':
        textStyleObj = { ...textStyleObj, ...styles.smallText };
        break;
      case 'medium':
        textStyleObj = { ...textStyleObj, ...styles.mediumText };
        break;
      case 'large':
        textStyleObj = { ...textStyleObj, ...styles.largeText };
        break;
    }
    
    if (disabled) {
      textStyleObj = { ...textStyleObj, ...styles.disabledText };
    }
    
    return textStyleObj;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {leftIcon && !loading && leftIcon}
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={type === 'primary' ? '#FFFFFF' : '#4A90E2'} 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
      {rightIcon && !loading && rightIcon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 버튼 타입별 스타일
  primaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryButton: {
    backgroundColor: '#E1EFF9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  textButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  
  // 버튼 크기별 스타일
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 100,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 120,
  },
  
  // 비활성화 버튼 스타일
  disabledButton: {
    backgroundColor: '#E5E5E5',
    borderColor: '#E5E5E5',
  },
  
  // 텍스트 스타일
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  outlineText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  textOnlyText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  
  // 텍스트 크기별 스타일
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  
  // 비활성화 텍스트 스타일
  disabledText: {
    color: '#9E9E9E',
  },
});

export default Button;