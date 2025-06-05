import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View, FlatList, Button } from 'react-native';

// 메모리 누수 가능성이 있는 컴포넌트 (큰 데이터를 생성하고 유지함)
const LargeDataComponent = ({ itemCount = 1000 }) => {
  const [items, setItems] = useState(() => 
    Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      value: `Item ${i}`,
      // 각 아이템에 큰 데이터 추가
      largeData: new Array(1000).fill('데이터').join(''),
    }))
  );
  
  const addMoreItems = () => {
    const newItems = Array.from({ length: 500 }, (_, i) => ({
      id: items.length + i,
      value: `Item ${items.length + i}`,
      largeData: new Array(1000).fill('데이터').join(''),
    }));
    setItems([...items, ...newItems]);
  };
  
  return (
    <View>
      <Button title="Add 500 More Items" onPress={addMoreItems} testID="add-more-button" />
      <FlatList
        data={items}
        keyExtractor={(item) => `item-${item.id}`}
        renderItem={({ item }) => <Text>{item.value}</Text>}
      />
    </View>
  );
};

// 메모리 누수가 있는 컴포넌트 (클로저를 통해 이전 데이터 참조를 유지함)
const MemoryLeakComponent = () => {
  const [counter, setCounter] = useState(0);
  const [leakedData, setLeakedData] = useState<any[]>([]);
  
  const createLeak = () => {
    // 의도적으로 큰 배열을 메모리에 유지시킴
    const newArray = new Array(10000).fill('메모리 누수 데이터');
    setLeakedData([...leakedData, newArray]);
    setCounter(counter + 1);
  };
  
  return (
    <View>
      <Text testID="counter-text">Counter: {counter}</Text>
      <Text testID="leak-size-text">Leaked Data Size: {leakedData.length}</Text>
      <Button title="Create Memory Leak" onPress={createLeak} testID="create-leak-button" />
    </View>
  );
};

// 최적화된 컴포넌트 (이벤트핸들러를 useCallback으로 메모이제이션)
const OptimizedComponent = ({ itemCount = 1000 }) => {
  const [items] = useState(() => 
    Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      value: `Item ${i}`,
    }))
  );
  
  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <Text>{item.value}</Text>
  ), []);
  
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `item-${item.id}`}
      renderItem={renderItem}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};

describe('메모리 사용량 테스트', () => {
  test('LargeDataComponent가 많은 데이터를 처리할 수 있어야 함', () => {
    const { getByTestId } = render(<LargeDataComponent itemCount={100} />);
    
    // 더 많은 아이템 추가 버튼을 누름
    const addButton = getByTestId('add-more-button');
    fireEvent.press(addButton);
    
    // 메모리 오류없이 실행되어야 함
    // 실제 환경에서는 메모리 프로파일러로 측정 필요
  });

  test('MemoryLeakComponent가 버튼 클릭마다 메모리를 더 사용함', () => {
    const { getByTestId } = render(<MemoryLeakComponent />);
    
    const leakButton = getByTestId('create-leak-button');
    
    // 여러번 누름
    for (let i = 0; i < 5; i++) {
      fireEvent.press(leakButton);
    }
    
    // 카운터가 증가했는지 확인
    expect(getByTestId('counter-text').props.children).toEqual(['Counter: ', 5]);
    expect(getByTestId('leak-size-text').props.children).toEqual(['Leaked Data Size: ', 5]);
    
    // 실제 환경에서는 메모리 사용량을 측정해야 함
  });

  test('OptimizedComponent가 효율적으로 렌더링되어야 함', () => {
    // 렌더링 시간 측정
    const start = performance.now();
    render(<OptimizedComponent itemCount={500} />);
    const end = performance.now();
    
    console.log(`OptimizedComponent 렌더링 시간: ${end - start}ms`);
    
    // 테스트 환경에서는 정확한 메모리 사용량을 측정하기 어려움
    // 실제 기기에서 React DevTools Profiler로 확인 필요
  });

  test('컴포넌트가 마운트 해제될 때 메모리가 적절히 해제되어야 함', () => {
    const { unmount } = render(<LargeDataComponent itemCount={500} />);
    
    // 컴포넌트 마운트 해제
    unmount();
    
    // 실제 환경에서는 GC 후 메모리 사용량 확인 필요
    // 여기서는 오류 없이 마운트 해제됨을 확인
  });
});