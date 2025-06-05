// src/components/LoadingIndicator.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  testID?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  color = '#4A90E2',
  text = '로딩 중...',
  testID = 'loading-indicator' // 명시적 testID 추가
}) => {
  return (
    <View 
      style={styles.container}
      testID={testID} // testID 적용
    >
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});

export default LoadingIndicator;