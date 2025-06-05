// __mocks__/HomeScreenMock.tsx
import React from 'react';
import { View, Text } from 'react-native';

export const MockHomeScreen = () => {
  return (
    <View testID="home-screen-mock">
      <View testID="emotion-surface">
        <Text>오늘의 감정</Text>
      </View>
      <View testID="post-input-card">
        <Text>나의 하루는...</Text>
      </View>
      <Text>누군가의 하루는..</Text>
    </View>
  );
};

export default MockHomeScreen;