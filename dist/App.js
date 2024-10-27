"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("react-native-gesture-handler");
const react_1 = __importDefault(require("react"));
const native_1 = require("@react-navigation/native");
const bottom_tabs_1 = require("@react-navigation/bottom-tabs");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const react_native_paper_1 = require("react-native-paper");
const MaterialCommunityIcons_1 = __importDefault(require("react-native-vector-icons/MaterialCommunityIcons"));
const ComfortScreen_1 = __importDefault(require("@screens/ComfortScreen"));
const ReviewScreen_1 = __importDefault(require("@screens/ReviewScreen"));
const ChallengeScreen_1 = __importDefault(require("@screens/ChallengeScreen"));
require("react-native-gesture-handler");
const react_native_screens_1 = require("react-native-screens");
const HomeScreen_1 = __importDefault(require("@screens/HomeScreen"));
(0, react_native_screens_1.enableScreens)();
const Tab = (0, bottom_tabs_1.createBottomTabNavigator)();
const theme = Object.assign(Object.assign({}, react_native_paper_1.MD3LightTheme), { colors: Object.assign(Object.assign({}, react_native_paper_1.MD3LightTheme.colors), { primary: '#4a0e4e', accent: '#8a2be2', background: '#f0e6ff' }) });
const { LightTheme } = (0, react_native_paper_1.adaptNavigationTheme)({ reactNavigationLight: theme });
const App = () => {
    return (<react_native_paper_1.Provider theme={theme}>
      <react_native_safe_area_context_1.SafeAreaProvider>
        <native_1.NavigationContainer theme={LightTheme}>
          <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
                let iconName;
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
                return <MaterialCommunityIcons_1.default name={iconName} size={size} color={color}/>;
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
        })}>
            <Tab.Screen name="Home" component={HomeScreen_1.default} options={{
            tabBarLabel: '홈',
            headerTitle: '나의 오늘',
        }}/>
            <Tab.Screen name="Comfort" component={ComfortScreen_1.default} options={{ tabBarLabel: '위로와 공감' }}/>
            <Tab.Screen name="Review" component={ReviewScreen_1.default} options={{ tabBarLabel: '일상 돌아보기' }}/>
            <Tab.Screen name="Challenge" component={ChallengeScreen_1.default} options={{ tabBarLabel: '감정 챌린지' }}/>
          </Tab.Navigator>
        </native_1.NavigationContainer>
      </react_native_safe_area_context_1.SafeAreaProvider>
    </react_native_paper_1.Provider>);
};
exports.default = App;
