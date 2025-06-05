// __tests__/contexts/EmotionContext.test.tsx
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { EmotionProvider, useEmotion } from '../../src/contexts/EmotionContext';

// API 서비스 모킹
jest.mock('../../src/services/api/emotionService', () => ({
  getAllEmotions: jest.fn().mockResolvedValue({ 
    data: [
      { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
      { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' }
    ] 
  }),
  getDailyEmotionCheck: jest.fn().mockResolvedValue({ 
    data: [
      { log_id: 1, user_id: 1, emotion_id: 1, note: '오늘은 즐거운 하루', log_date: '2025-04-12', created_at: '2025-04-12T14:22:30Z', updated_at: '2025-04-12T14:22:30Z' }
    ] 
  }),
  recordEmotions: jest.fn().mockResolvedValue({ data: { success: true } })
}));

// 테스트용 소비자 컴포넌트
const TestConsumer = () => {
  const {
    emotions,
    userEmotions,
    selectedEmotions,
    isLoading,
    error,
    fetchEmotions,
    fetchUserEmotions,
    logEmotion,
    selectEmotion,
    clearSelectedEmotions
  } = useEmotion();

  const { Text, View, Button } = require('react-native');

  return (
    <View>
      <Text testID="loading-state">{isLoading ? 'loading' : 'not-loading'}</Text>
      <Text testID="emotions-count">{emotions.length}</Text>
      <Text testID="user-emotions-count">{userEmotions.length}</Text>
      <Text testID="error-message">{error || 'no-error'}</Text>
      <Text testID="selected-emotions-count">{selectedEmotions.length}</Text>
      
      <Button
        testID="fetch-emotions-button"
        title="감정 목록 불러오기"
        onPress={() => fetchEmotions()}
      />
      <Button
        testID="fetch-user-emotions-button"
        title="사용자 감정 불러오기"
        onPress={() => fetchUserEmotions()}
      />
      <Button
        testID="log-emotion-button"
        title="감정 기록하기"
        onPress={() => logEmotion(1, '테스트 감정')}
      />
      <Button
        testID="select-emotion-button"
        title="감정 선택하기"
        onPress={() => selectEmotion(1)}
      />
      <Button
        testID="clear-emotions-button"
        title="감정 선택 초기화"
        onPress={() => clearSelectedEmotions()}
      />
    </View>
  );
};

describe('EmotionContext', () => {
  it('provides initial state and functions', async () => {
    const { getByTestId } = render(
      <EmotionProvider>
        <TestConsumer />
      </EmotionProvider>
    );
    
    // 초기 로딩 상태 확인
    expect(getByTestId('loading-state')).toHaveTextContent('loading');
    
    // 비동기 작업 완료 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 데이터 로드 확인
    expect(getByTestId('loading-state')).toHaveTextContent('not-loading');
    expect(getByTestId('emotions-count')).not.toHaveTextContent('0');
  });
  
  it('loads user emotions when requested', async () => {
    const { getByTestId } = render(
      <EmotionProvider>
        <TestConsumer />
      </EmotionProvider>
    );
    
    // 초기 로드 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 사용자 감정 로드 요청
    await act(async () => {
      fireEvent.press(getByTestId('fetch-user-emotions-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(getByTestId('user-emotions-count')).not.toHaveTextContent('0');
  });
  
  it('selects and clears emotions', async () => {
    const { getByTestId } = render(
      <EmotionProvider>
        <TestConsumer />
      </EmotionProvider>
    );
    
    // 초기 로드 대기
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // 초기 선택된 감정 수 확인
    expect(getByTestId('selected-emotions-count')).toHaveTextContent('0');
    
    // 감정 선택
    await act(async () => {
      fireEvent.press(getByTestId('select-emotion-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(getByTestId('selected-emotions-count')).toHaveTextContent('1');
    
    // 감정 선택 초기화
    await act(async () => {
      fireEvent.press(getByTestId('clear-emotions-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(getByTestId('selected-emotions-count')).toHaveTextContent('0');
  });
});