// src/navigation/HomeStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../src/screens/HomeScreen';
import EmotionLogScreen from '../../src/screens/EmotionLogScreen';

type HomeStackParamList = {
  HomeMain: undefined;
  EmotionLog: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: '나의 하루' }} />
      <Stack.Screen name="EmotionLog" component={EmotionLogScreen} options={{ title: '감정 기록' }} />
    </Stack.Navigator>
  );
};

export default HomeStack;