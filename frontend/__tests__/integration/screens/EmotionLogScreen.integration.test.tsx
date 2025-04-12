import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EmotionLogScreen from '../../../src/screens/EmotionLogScreen';
import emotionService from '../../../src/services/api/emotionService';

// 모킹
jest.mock('../../../src/services/api/emotionService', () => ({
  getAllEmotions: jest.fn(),
  recordEmotions: jest.fn()
}));

// Alert 모킹
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

// 네비게이션 모킹
const mockNavigation = { goBack: jest.fn() };

// 목 데이터 - 실제 API 응답 구조에 맞춰 수정
const mockEmotions = [
  { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
  { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
  { emotion_id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB' },
  { emotion_id: 4, name: '감동', icon: 'heart-outline', color: '#FF6347' },
  { emotion_id: 5, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4' },
  { emotion_id: 6, name: '불안', icon: 'alert-outline', color: '#DDA0DD' },
  { emotion_id: 7, name: '화남', icon: 'emoticon-angry-outline', color: '#FF4500' },
  { emotion_id: 8, name: '지침', icon: 'emoticon-neutral-outline', color: '#A9A9A9' },
  { emotion_id: 9, name: '우울', icon: 'weather-cloudy', color: '#708090' },
  { emotion_id: 10, name: '고독', icon: 'account-outline', color: '#8B4513' },
  { emotion_id: 11, name: '충격', icon: 'lightning-bolt', color: '#9932CC' },
  { emotion_id: 12, name: '편함', icon: 'sofa-outline', color: '#32CD32' }
];

describe('EmotionLogScreen 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 모킹된 함수가 즉시 응답하도록 설정
    (emotionService.getAllEmotions as jest.Mock).mockResolvedValue({ 
      data: { 
        status: 'success', 
        data: mockEmotions 
      } 
    });
    (emotionService.recordEmotions as jest.Mock).mockResolvedValue({ status: 200 });
  });

  // 컴포넌트 렌더링 테스트
  it('렌더링이 올바르게 됨', async () => {
    const { getByText } = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    // 초기 로딩 화면 확인
    expect(getByText('감정 데이터를 불러오는 중...')).toBeTruthy();
    
    // 데이터 로드 완료 후 화면 확인
    await waitFor(() => {
      expect(getByText('오늘의 감정')).toBeTruthy();
      expect(getByText('현재 어떤 감정을 느끼고 계신가요?')).toBeTruthy();
    });
  }, 30000);

  // 감정 칩 렌더링 테스트
  it('모든 감정 칩이 올바르게 렌더링됨', async () => {
    const { findByText } = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    // findByText를 사용해 각 감정을 확인
    for (const emotion of mockEmotions) {
      const emotionChip = await findByText(emotion.name);
      expect(emotionChip).toBeTruthy();
    }
  }, 30000);

  // 감정 선택 상태 변경 테스트
  it('감정 칩을 클릭하면 선택 상태가 변경됨', async () => {
    const { findByText, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    // 행복 감정 찾기
    const happyChip = await findByText('행복');
    expect(happyChip).toBeTruthy();
    
    // 감정 선택
    fireEvent.press(happyChip);
    
    // 제출 버튼이 활성화되었는지 확인
    const submitButton = await findByTestId('emotion-submit-button');
    await waitFor(() => {
      expect(submitButton.props.accessibilityState.disabled).toBeFalsy();
    });
  }, 30000);

  // 여러 감정 선택 테스트
  it('여러 감정을 선택할 수 있음', async () => {
    const { findByText, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    // 여러 감정 찾기 및 선택
    const happyChip = await findByText('행복');
    const gratefulChip = await findByText('감사');
    const comfortChip = await findByText('위로');
    
    fireEvent.press(happyChip);
    fireEvent.press(gratefulChip);
    fireEvent.press(comfortChip);
    
    // 제출 버튼이 활성화되었는지 확인
    const submitButton = await findByTestId('emotion-submit-button');
    await waitFor(() => {
      expect(submitButton.props.accessibilityState.disabled).toBeFalsy();
    });
  }, 30000);

  // 메모 입력 테스트
  it('메모 입력이 가능함', async () => {
    const { findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    const noteInput = await findByTestId('emotion-note-input');
    expect(noteInput).toBeTruthy();
    
    fireEvent.changeText(noteInput, '오늘은 정말 좋은 하루였습니다.');
  }, 30000);

  // 제출 버튼 테스트
  it('감정 선택 후 제출 버튼이 활성화됨', async () => {
    const { findByText, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    // 감정 선택
    const happyChip = await findByText('행복');
    fireEvent.press(happyChip);
    
    // 제출 버튼 확인
    const submitButton = await findByTestId('emotion-submit-button');
    await waitFor(() => {
      expect(submitButton.props.accessibilityState.disabled).toBeFalsy();
    });
  }, 30000);

  // 기록 성공 테스트
  it('감정 기록 제출 성공 시 확인 메시지와 화면 이동이 동작함', async () => {
    const { findByText, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    // 감정 선택
    const happyChip = await findByText('행복');
    fireEvent.press(happyChip);
    
    // 제출 버튼 클릭
    const submitButton = await findByTestId('emotion-submit-button');
    fireEvent.press(submitButton);
    
    // API 호출 확인
    await waitFor(() => {
      expect(emotionService.recordEmotions).toHaveBeenCalled();
    });
    
    // Alert 호출 확인
    expect(Alert.alert).toHaveBeenCalledWith(
      '감정 기록 완료',
      '오늘의 감정이 성공적으로 기록되었습니다.',
      expect.anything()
    );
    
    // Alert의 콜백 함수 호출 시뮬레이션
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2][0];
    confirmButton.onPress();
    
    // 네비게이션 확인
    expect(mockNavigation.goBack).toHaveBeenCalled();
  }, 30000);

  // 기록 실패 테스트
  it('감정 기록 제출 실패 시 에러 메시지가 표시됨', async () => {
    // API 오류 설정
    (emotionService.recordEmotions as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: '감정 기록 실패' } }
    });
    
    const { findByText, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    // 감정 선택
    const happyChip = await findByText('행복');
    fireEvent.press(happyChip);
    
    // 제출 버튼 클릭
    const submitButton = await findByTestId('emotion-submit-button');
    fireEvent.press(submitButton);
    
    // API 호출 확인
    await waitFor(() => {
      expect(emotionService.recordEmotions).toHaveBeenCalled();
    });
    
    // Alert 호출 확인
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('오류', '감정 기록 실패');
    });
  }, 30000);

  // 새로운 테스트 - 감정 선택 해제 테스트
  it('감정을 선택했다가 다시 클릭하면 선택이 해제됨', async () => {
    const { findByText, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} />);
    
    // 감정 선택
    const happyChip = await findByText('행복');
    fireEvent.press(happyChip);
    
    // 제출 버튼이 활성화됨
    const submitButton = await findByTestId('emotion-submit-button');
    await waitFor(() => {
      expect(submitButton.props.accessibilityState.disabled).toBeFalsy();
    });
    
    // 감정 다시 클릭해서 선택 해제
    fireEvent.press(happyChip);
    
    // 제출 버튼이 다시 비활성화됨
    await waitFor(() => {
      expect(submitButton.props.accessibilityState.disabled).toBeTruthy();
    });
  }, 30000);
});