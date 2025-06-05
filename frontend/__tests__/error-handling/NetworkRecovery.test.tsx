import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, Button, View } from 'react-native';
import axios from 'axios';

// axios 모킹
jest.mock('axios');

// 네트워크 오류 처리 및 재시도 로직을 테스트하기 위한 컴포넌트
const DataFetchingComponent = () => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('https://api.example.com/data');
      setData(response.data);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {loading && <Text testID="loading">로딩 중...</Text>}
      {error && (
        <View testID="error-view">
          <Text>{error}</Text>
          <Button title="다시 시도" onPress={fetchData} testID="retry-button" />
        </View>
      )}
      {data && <Text testID="data">{JSON.stringify(data)}</Text>}
      <Button
        title="데이터 가져오기"
        onPress={fetchData}
        disabled={loading}
        testID="fetch-button"
      />
    </View>
  );
};

describe('네트워크 오류 복구 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('네트워크 오류 발생 시 오류 메시지와 재시도 버튼을 표시해야 함', async () => {
    // 첫 번째 요청에서 네트워크 오류를 발생시킴
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));
    
    const { getByTestId, queryByTestId } = render(<DataFetchingComponent />);
    
    // 데이터 가져오기 버튼 클릭
    fireEvent.press(getByTestId('fetch-button'));
    
    // 로딩 상태 확인
    expect(getByTestId('loading')).toBeTruthy();
    
    // 오류 메시지와 재시도 버튼이 표시되는지 확인
    await waitFor(() => {
      expect(queryByTestId('loading')).toBeNull();
      expect(getByTestId('error-view')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });
  });

  test('재시도 버튼 클릭 시 데이터를 성공적으로 가져와야 함', async () => {
    // 첫 번째 요청에서는 오류를 발생시키고, 두 번째 요청에서는 성공을 반환
    (axios.get as jest.Mock)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({ data: { message: '성공적으로 데이터를 불러왔습니다.' } });
    
    const { getByTestId, queryByTestId } = render(<DataFetchingComponent />);
    
    // 데이터 가져오기 버튼 클릭
    fireEvent.press(getByTestId('fetch-button'));
    
    // 오류 발생 후 재시도 버튼이 표시되기를 기다림
    await waitFor(() => {
      expect(getByTestId('error-view')).toBeTruthy();
    });
    
    // 재시도 버튼 클릭
    fireEvent.press(getByTestId('retry-button'));
    
    // 로딩 상태 확인
    expect(getByTestId('loading')).toBeTruthy();
    
    // 데이터가 성공적으로 로드되는지 확인
    await waitFor(() => {
      expect(queryByTestId('loading')).toBeNull();
      expect(queryByTestId('error-view')).toBeNull();
      expect(getByTestId('data')).toBeTruthy();
    });
  });
});