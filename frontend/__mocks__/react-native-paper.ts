// __mocks__/react-native-paper.ts
import React from 'react';

interface MockComponentProps {
  testID?: string;
  [key: string]: any;
}

const mockComponent = (name: string) => (props: MockComponentProps) => {
  return React.createElement(name, {
    ...props,
    'data-testid': props.testID
  });
};

export const Button = mockComponent('Button');
export const Text = mockComponent('Text');
export const TextInput = mockComponent('TextInput');
export const Card = {
  Content: mockComponent('Card.Content'),
  Actions: mockComponent('Card.Actions'),
  Title: mockComponent('Card.Title')
};
export const Dialog = {
  Title: mockComponent('Dialog.Title'),
  Content: mockComponent('Dialog.Content'),
  Actions: mockComponent('Dialog.Actions')
};
export const Portal = mockComponent('Portal');
export const IconButton = mockComponent('IconButton');
export const Surface = mockComponent('Surface');
export const FAB = mockComponent('FAB');
export const Divider = mockComponent('Divider');
export const Chip = mockComponent('Chip');
export const Avatar = {
  Icon: mockComponent('Avatar.Icon')
};
export const ActivityIndicator = mockComponent('ActivityIndicator');
export const useTheme = () => ({ colors: { primary: '#6200ee', surface: '#ffffff' } });