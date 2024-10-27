import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../../screens/HomeScreen';
import ComfortScreen from '../../screens/ComfortScreen';
import ReviewScreen from '../../screens/ReviewScreen';
import ChallengeScreen from '../../screens/ChallengeScreen';

type RootTabParamList = {
  Home: undefined;
  Comfort: undefined;
  Review: undefined;
  Challenge: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Comfort') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Review') {
              iconName = focused ? 'book-open' : 'book-open-outline';
            } else if (route.name === 'Challenge') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            } else {
              iconName = 'circle';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
        <Tab.Screen name="Comfort" component={ComfortScreen} options={{ title: '위로와 공감' }} />
        <Tab.Screen name="Review" component={ReviewScreen} options={{ title: '일상 돌아보기' }} />
        <Tab.Screen name="Challenge" component={ChallengeScreen} options={{ title: '감정 챌린지' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;