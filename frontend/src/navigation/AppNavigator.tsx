// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';

// 스크린 가져오기
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ComfortScreen from '../screens/ComfortScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import ReviewScreen from '../screens/ReviewScreen';
import EmotionLogScreen from '../screens/EmotionLogScreen';
import ApiTestScreen from '../screens/ApiTestScreen'; // 테스트용

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ApiTest: undefined;
};

type HomeStackParamList = {
  HomeMain: undefined;
  EmotionLog: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Comfort: undefined;
  Challenge: undefined;
  Review: undefined;
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 로그인하지 않은 사용자를 위한 스택
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ApiTest" component={ApiTestScreen} />
    </Stack.Navigator>
  );
};

// 홈 화면을 위한 스택 (상세 페이지 등을 포함)
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: '나의 하루' }} />
      <Stack.Screen name="EmotionLog" component={EmotionLogScreen} options={{ title: '감정 기록' }} />
    </Stack.Navigator>
  );
};

// 로그인한 사용자를 위한 메인 탭 네비게이션
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

// 메인 네비게이션
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // 로딩 인디케이터 표시할 수도 있음
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="AuthStack" component={AuthStack} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;