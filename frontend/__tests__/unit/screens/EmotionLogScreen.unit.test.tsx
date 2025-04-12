// tests/unit/EmotionLogScreen.unit.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EmotionLogScreen from '../../../src/screens/EmotionLogScreen';
import emotionService from '../../../src/services/api/emotionService';

// 목 데이터
const mockEmotions = {
  status: 'success',
  data: [
    { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
    { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
    { emotion_id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB' }
  ]
};

// 모킹 설정
jest.mock('../../../src/services/api/emotionService', () => ({
  getAllEmotions: jest.fn(),
  recordEmotions: jest.fn()
}));

// Alert 모킹
const mockAlert = jest.fn();
Alert.alert = mockAlert;

// 네비게이션 모킹
const mockNavigation = { goBack: jest.fn() };

describe('EmotionLogScreen 단위 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (emotionService.getAllEmotions as jest.Mock).mockResolvedValue({ data: mockEmotions });
    (emotionService.recordEmotions as jest.Mock).mockResolvedValue({ status: 200 });
  });

  const setupRenderAndWaitForEmotions = async () => {
    const renderResult = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(renderResult.getByText('행복')).toBeTruthy();
    }, { timeout: 10000 });

    return renderResult;
  };

  test('감정 데이터를 성공적으로 로드함', async () => {
    const { getByText, queryByText } = await setupRenderAndWaitForEmotions();
    
    expect(emotionService.getAllEmotions).toHaveBeenCalledTimes(1);
    expect(queryByText('감정 데이터를 불러오는 중...')).toBeNull();
    expect(getByText('오늘의 감정')).toBeTruthy();
    expect(getByText('현재 어떤 감정을 느끼고 계신가요?')).toBeTruthy();
    expect(getByText('행복')).toBeTruthy();
    expect(getByText('감사')).toBeTruthy();
    expect(getByText('위로')).toBeTruthy();
  }, 15000);

  test('감정 데이터 로드 실패 시 알림 표시', async () => {
    (emotionService.getAllEmotions as jest.Mock).mockRejectedValue(new Error('네트워크 오류'));
    
    render(<EmotionLogScreen navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        '오류', 
        '감정 데이터를 불러오는 중 오류가 발생했습니다.'
      );
    }, { timeout: 10000 });
  }, 15000);

  test('감정 선택/해제 기능이 정상 작동함', async () => {
    const { getByText } = await setupRenderAndWaitForEmotions();
    
    // 감정 선택
    fireEvent.press(getByText('행복'));
    
    // 감정 해제
    fireEvent.press(getByText('행복'));
    
    // 다른 감정 선택
    fireEvent.press(getByText('감사'));
  }, 15000);

  test('메모 입력이 정상 작동함', async () => {
    const { getByTestId } = await setupRenderAndWaitForEmotions();
    
    const noteInput = getByTestId('emotion-note-input');
    fireEvent.changeText(noteInput, '오늘은 좋은 날이었습니다.');
    
    expect(noteInput.props.value).toBe('오늘은 좋은 날이었습니다.');
  }, 15000);

  test('감정 선택 없을 때 제출 버튼이 비활성화됨', async () => {
    const { getByTestId } = await setupRenderAndWaitForEmotions();
    
    const submitButton = getByTestId('emotion-submit-button');
    
    expect(submitButton.props.accessibilityState.disabled).toBeTruthy();
  }, 15000);

  test('감정 로그 제출 성공 시 알림 및 화면 이동', async () => {
    const { getByText, getByTestId } = await setupRenderAndWaitForEmotions();
    
    // 감정 선택
    fireEvent.press(getByText('행복'));
    
    // 제출
    const submitButton = getByTestId('emotion-submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(emotionService.recordEmotions).toHaveBeenCalledWith({
        emotion_ids: [1],
        note: undefined
      });
      
      // 성공 알림 확인
      expect(mockAlert).toHaveBeenCalledWith(
        '감정 기록 완료',
        '오늘의 감정이 성공적으로 기록되었습니다.',
        [{ text: '확인', onPress: expect.any(Function) }]
      );
    }, { timeout: 10000 });
    
    // 알림의 확인 버튼 클릭 시뮬레이션
    const alertButtons = mockAlert.mock.calls[0][2];
    alertButtons[0].onPress();
    
    expect(mockNavigation.goBack).toHaveBeenCalled();
  }, 15000);

  test('감정 로그 제출 실패 시 에러 알림', async () => {
    (emotionService.recordEmotions as jest.Mock).mockRejectedValue({
      response: { data: { message: '서버 오류가 발생했습니다.' } }
    });
    
    const { getByText, getByTestId } = await setupRenderAndWaitForEmotions();
    
    // 감정 선택
    fireEvent.press(getByText('행복'));
    
    // 제출
    const submitButton = getByTestId('emotion-submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        '오류', 
        '서버 오류가 발생했습니다.'
      );
    }, { timeout: 10000 });
  }, 15000);
});