// src/navigation/AuthStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ApiTestScreen from '../screens/ApiTestScreen'; // 테스트용

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ApiTest: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

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

export default AuthStack;