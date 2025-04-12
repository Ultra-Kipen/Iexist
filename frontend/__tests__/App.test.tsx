/**
 * @format
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// 간단한 스냅샷 테스트로 변경
jest.mock('../src/navigation/AppNavigator', () => 'AppNavigator');

test('renders without crashing', () => {
  const { toJSON } = render(<App />);
  expect(toJSON()).toBeTruthy();
});