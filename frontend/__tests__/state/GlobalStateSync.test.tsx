import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Button, View } from 'react-native';

// 전역 상태 컨텍스트
const StateContext = React.createContext({
  count: 0,
  increment: () => {},
  decrement: () => {},
});

// 상태 제공자 컴포넌트
const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = React.useState(0);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  
  return (
    <StateContext.Provider value={{ count, increment, decrement }}>
      {children}
    </StateContext.Provider>
  );
};

// 상태를 표시하는 컴포넌트
const CountDisplay = () => {
  const { count } = React.useContext(StateContext);
  return <Text testID="count-display">Count: {count}</Text>;
};

// 상태를 변경하는 컴포넌트
const CountControls = () => {
  const { increment, decrement } = React.useContext(StateContext);
  return (
    <View>
      <Button title="증가" onPress={increment} testID="increment-button" />
      <Button title="감소" onPress={decrement} testID="decrement-button" />
    </View>
  );
};

// 두 컴포넌트를 분리하여 렌더링하는 앱
const TestApp = () => {
  return (
    <StateProvider>
      <View>
        <CountDisplay />
        <CountControls />
      </View>
    </StateProvider>
  );
};

describe('전역 상태 동기화 테스트', () => {
  test('상태가 여러 컴포넌트 간에 동기화되어야 함', () => {
    const { getByTestId } = render(<TestApp />);
    
    // 초기 상태 확인
    expect(getByTestId('count-display').props.children).toEqual(['Count: ', 0]);
    
    // 증가 버튼 클릭
    fireEvent.press(getByTestId('increment-button'));
    expect(getByTestId('count-display').props.children).toEqual(['Count: ', 1]);
    
    // 다시 증가 버튼 클릭
    fireEvent.press(getByTestId('increment-button'));
    expect(getByTestId('count-display').props.children).toEqual(['Count: ', 2]);
    
    // 감소 버튼 클릭
    fireEvent.press(getByTestId('decrement-button'));
    expect(getByTestId('count-display').props.children).toEqual(['Count: ', 1]);
  });
});