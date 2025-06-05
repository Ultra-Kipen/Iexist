// src/navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeStack from './HomeStack';
import ComfortScreen from '../screens/ComfortScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import ReviewScreen from '../screens/ReviewScreen';

type MainTabParamList = {
  Home: undefined;
  Comfort: undefined;
  Challenge: undefined;
  Review: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4a0e4e',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarLabel: '나의 하루',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Comfort"
        component={ComfortScreen}
        options={{
          tabBarLabel: '위로와 공감',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="hand-heart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{
          tabBarLabel: '감정 챌린지',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="flag" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Review"
        component={ReviewScreen}
        options={{
          tabBarLabel: '일상 돌아보기',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="calendar-text" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;