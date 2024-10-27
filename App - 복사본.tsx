import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ComfortScreen from '@screens/ComfortScreen';
import ReviewScreen from '@screens/ReviewScreen';
import ChallengeScreen from '@screens/ChallengeScreen';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import HomeScreen from '@screens/HomeScreen';

enableScreens();
type RootTabParamList = {
  Home: undefined;
  Comfort: undefined;
  Review: undefined;
  Challenge: undefined;
};
const Tab = createBottomTabNavigator<RootTabParamList>();
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4a0e4e',
    accent: '#8a2be2',
    background: '#f0e6ff',
  },
};

const { LightTheme } = adaptNavigationTheme({ reactNavigationLight: theme });

const App: React.FC = () => {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer theme={LightTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                let iconName: string;
              
                switch (route.name) {
                  case 'Home':
                    iconName = 'home-heart';
                    break;
                  case 'Comfort':
                    iconName = 'hand-heart';
                    break;
                  case 'Review':
                    iconName = 'book-open-variant';
                    break;
                  case 'Challenge':
                    iconName = 'lightbulb-on';
                    break;
                  default:
                    iconName = 'help-circle';
                }
              
                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: 'gray',
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              tabBarStyle: { display: 'flex' },
              tabBarLabelStyle: { display: 'flex' },
            })}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: '홈',
                headerTitle: '나의 오늘',
              }}
            />
            <Tab.Screen name="Comfort" component={ComfortScreen} options={{ tabBarLabel: '위로와 공감' }} />
            <Tab.Screen name="Review" component={ReviewScreen} options={{ tabBarLabel: '일상 돌아보기' }} />
            <Tab.Screen name="Challenge" component={ChallengeScreen} options={{ tabBarLabel: '감정 챌린지' }} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;