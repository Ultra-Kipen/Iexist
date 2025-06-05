// __tests__/responsive/ResponsiveRendering.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Dimensions, View, Text, StyleSheet } from 'react-native';

// 테스트할 실제 반응형 컴포넌트 구현
function ResponsiveComponent() {
  const { width } = Dimensions.get('window');
  const isLargeScreen = width >= 768;
  const isTablet = width >= 480 && width < 768;
  
  const styles = StyleSheet.create({
    container: {
      padding: isLargeScreen ? 20 : (isTablet ? 15 : 10),
      maxWidth: isLargeScreen ? 1024 : (isTablet ? 640 : '100%'),
    },
    text: {
      fontSize: isLargeScreen ? 18 : (isTablet ? 16 : 14),
      fontWeight: isLargeScreen ? 'bold' : 'normal',
    }
  });
  
  return (
    <View testID="responsive-container" style={styles.container}>
      <Text testID="responsive-text" style={styles.text}>
        반응형 컴포넌트
      </Text>
      {isLargeScreen && (
        <View testID="large-screen-only">
          <Text>대형 화면에서만 보이는 콘텐츠</Text>
        </View>
      )}
      {isTablet && (
        <View testID="tablet-only">
          <Text>태블릿 화면에서만 보이는 콘텐츠</Text>
        </View>
      )}
      {width < 480 && (
        <View testID="mobile-only">
          <Text>모바일 화면에서만 보이는 콘텐츠</Text>
        </View>
      )}
    </View>
  );
}

// 실제 테스트 코드
describe('반응형 컴포넌트 테스트', () => {
  let originalDimensionsGet;
  
  beforeEach(() => {
    originalDimensionsGet = Dimensions.get;
  });
  
  afterEach(() => {
    Dimensions.get = originalDimensionsGet;
  });
  
  test('모바일 화면 크기에서 적절한 스타일과 컴포넌트가 렌더링되어야 함', () => {
    // 모바일 화면 크기 모킹
    Dimensions.get = jest.fn((dim) => {
      if (dim === 'window' || dim === 'screen') {
        return { width: 360, height: 640, scale: 1, fontScale: 1 };
      }
      return originalDimensionsGet(dim);
    });
    
    const { getByTestId, queryByTestId } = render(<ResponsiveComponent />);
    
    // 컨테이너 스타일 테스트
    const container = getByTestId('responsive-container');
    expect(container.props.style).toEqual({
      padding: 10,
      maxWidth: '100%'
    });
    
    // 텍스트 스타일 테스트
    const text = getByTestId('responsive-text');
    expect(text.props.style).toEqual({
      fontSize: 14,
      fontWeight: 'normal'
    });
    
    // 조건부 렌더링 테스트
    expect(queryByTestId('mobile-only')).toBeTruthy();
    expect(queryByTestId('tablet-only')).toBeNull();
    expect(queryByTestId('large-screen-only')).toBeNull();
  });
  
  test('태블릿 화면 크기에서 적절한 스타일과 컴포넌트가 렌더링되어야 함', () => {
    // 태블릿 화면 크기 모킹
    Dimensions.get = jest.fn((dim) => {
      if (dim === 'window' || dim === 'screen') {
        return { width: 600, height: 800, scale: 1, fontScale: 1 };
      }
      return originalDimensionsGet(dim);
    });
    
    const { getByTestId, queryByTestId } = render(<ResponsiveComponent />);
    
    // 컨테이너 스타일 테스트
    const container = getByTestId('responsive-container');
    expect(container.props.style).toEqual({
      padding: 15,
      maxWidth: 640
    });
    
    // 텍스트 스타일 테스트
    const text = getByTestId('responsive-text');
    expect(text.props.style).toEqual({
      fontSize: 16,
      fontWeight: 'normal'
    });
    
    // 조건부 렌더링 테스트
    expect(queryByTestId('mobile-only')).toBeNull();
    expect(queryByTestId('tablet-only')).toBeTruthy();
    expect(queryByTestId('large-screen-only')).toBeNull();
  });
  
  test('대형 화면 크기에서 적절한 스타일과 컴포넌트가 렌더링되어야 함', () => {
    // 대형 화면 크기 모킹
    Dimensions.get = jest.fn((dim) => {
      if (dim === 'window' || dim === 'screen') {
        return { width: 1024, height: 1366, scale: 1, fontScale: 1 };
      }
      return originalDimensionsGet(dim);
    });
    
    const { getByTestId, queryByTestId } = render(<ResponsiveComponent />);
    
    // 컨테이너 스타일 테스트
    const container = getByTestId('responsive-container');
    expect(container.props.style).toEqual({
      padding: 20,
      maxWidth: 1024
    });
    
    // 텍스트 스타일 테스트
    const text = getByTestId('responsive-text');
    expect(text.props.style).toEqual({
      fontSize: 18,
      fontWeight: 'bold'
    });
    
    // 조건부 렌더링 테스트
    expect(queryByTestId('mobile-only')).toBeNull();
    expect(queryByTestId('tablet-only')).toBeNull();
    expect(queryByTestId('large-screen-only')).toBeTruthy();
  });
  
  test('화면 크기가 변경될 때 컴포넌트가 올바르게 업데이트되어야 함', () => {
    // 초기 모바일 화면으로 시작
    Dimensions.get = jest.fn((dim) => {
      if (dim === 'window' || dim === 'screen') {
        return { width: 360, height: 640, scale: 1, fontScale: 1 };
      }
      return originalDimensionsGet(dim);
    });
    
    const { getByTestId, queryByTestId, rerender } = render(<ResponsiveComponent />);
    
    // 모바일 화면에서의 렌더링 확인
    expect(queryByTestId('mobile-only')).toBeTruthy();
    
    // 화면 크기를 태블릿으로 변경
    Dimensions.get = jest.fn((dim) => {
      if (dim === 'window' || dim === 'screen') {
        return { width: 600, height: 800, scale: 1, fontScale: 1 };
      }
      return originalDimensionsGet(dim);
    });
    
    // 컴포넌트 다시 렌더링
    rerender(<ResponsiveComponent />);
    
    // 태블릿 화면에서의 렌더링 확인
    expect(queryByTestId('mobile-only')).toBeNull();
    expect(queryByTestId('tablet-only')).toBeTruthy();
    
    // 화면 크기를 대형 화면으로 변경
    Dimensions.get = jest.fn((dim) => {
      if (dim === 'window' || dim === 'screen') {
        return { width: 1024, height: 1366, scale: 1, fontScale: 1 };
      }
      return originalDimensionsGet(dim);
    });
    
    // 컴포넌트 다시 렌더링
    rerender(<ResponsiveComponent />);
    
    // 대형 화면에서의 렌더링 확인
    expect(queryByTestId('tablet-only')).toBeNull();
    expect(queryByTestId('large-screen-only')).toBeTruthy();
  });
});