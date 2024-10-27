"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const native_1 = require("@react-navigation/native");
const bottom_tabs_1 = require("@react-navigation/bottom-tabs");
const MaterialCommunityIcons_1 = __importDefault(require("react-native-vector-icons/MaterialCommunityIcons"));
const HomeScreen_1 = __importDefault(require("../../screens/HomeScreen"));
const ComfortScreen_1 = __importDefault(require("../../screens/ComfortScreen"));
const ReviewScreen_1 = __importDefault(require("../../screens/ReviewScreen"));
const ChallengeScreen_1 = __importDefault(require("../../screens/ChallengeScreen"));
const Tab = (0, bottom_tabs_1.createBottomTabNavigator)();
const AppNavigator = () => {
    return (<native_1.NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                }
                else if (route.name === 'Comfort') {
                    iconName = focused ? 'heart' : 'heart-outline';
                }
                else if (route.name === 'Review') {
                    iconName = focused ? 'book-open' : 'book-open-outline';
                }
                else if (route.name === 'Challenge') {
                    iconName = focused ? 'trophy' : 'trophy-outline';
                }
                else {
                    iconName = 'circle';
                }
                return <MaterialCommunityIcons_1.default name={iconName} size={size} color={color}/>;
            },
        })}>
        <Tab.Screen name="Home" component={HomeScreen_1.default} options={{ title: '홈' }}/>
        <Tab.Screen name="Comfort" component={ComfortScreen_1.default} options={{ title: '위로와 공감' }}/>
        <Tab.Screen name="Review" component={ReviewScreen_1.default} options={{ title: '일상 돌아보기' }}/>
        <Tab.Screen name="Challenge" component={ChallengeScreen_1.default} options={{ title: '감정 챌린지' }}/>
      </Tab.Navigator>
    </native_1.NavigationContainer>);
};
exports.default = AppNavigator;
