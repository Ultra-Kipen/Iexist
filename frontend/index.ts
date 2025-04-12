import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import App from './App';

enableScreens(true);

AppRegistry.registerComponent('IExist', () => App);