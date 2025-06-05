// EmotionLogScreen.unit.test.tsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native'; // 직접 import
import EmotionLogScreen from '../../../src/screens/EmotionLogScreen';
import emotionService from '../../../src/services/api/emotionService';

// Alert.alert 모킹 - 실제 모듈을 import 후 spy 적용
const alertMock = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// 간단한 문자열 모킹 사용
jest.mock('react-native-paper', () => ({
  Text: 'Text',
  Chip: 'Chip',
  Button: 'Button',
  TextInput: 'TextInput',
  ActivityIndicator: 'ActivityIndicator'
}));

// MaterialCommunityIcons 모킹
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// emotionService 모킹
jest.mock('../../../src/services/api/emotionService', () => ({
  getAllEmotions: jest.fn(),
  recordEmotions: jest.fn(),
}));

describe('EmotionLogScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
  };

  const mockEmotions = [
    { 
      emotion_id: 1, 
      name: '행복', 
      icon: 'happy-icon', 
      color: '#FFD700' 
    },
    { 
      emotion_id: 2, 
      name: '슬픔', 
      icon: 'sad-icon', 
      color: '#4682B4' 
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 모든 테스트에 대한 기본 모킹 설정
    (emotionService.getAllEmotions as jest.Mock).mockResolvedValue({
      data: { 
        status: 'success', 
        data: mockEmotions 
      }
    });
  });

  afterEach(() => {
    alertMock.mockClear();
  });
  
  it('renders the screen correctly with all UI elements', async () => {
    const { getByTestId, getAllByTestId, getByText } = render(
      <EmotionLogScreen navigation={mockNavigation} />
    );

    // 화면의 주요 UI 요소 확인
    await waitFor(() => {
      // 제목 확인
      expect(getByText('오늘의 감정')).toBeTruthy();
      expect(getByText('현재 어떤 감정을 느끼고 계신가요?')).toBeTruthy();
      
      // 감정 칩 확인
      const emotionChips = getAllByTestId('emotion-chip');
      expect(emotionChips.length).toBe(2);
      
      // 입력 필드 및 버튼 확인
      expect(getByTestId('emotion-note-input')).toBeTruthy();
      expect(getByTestId('emotion-submit-button')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('loads emotion data from API on mount', async () => {
    render(<EmotionLogScreen navigation={mockNavigation} />);
    
    // API 호출 확인
    await waitFor(() => {
      expect(emotionService.getAllEmotions).toHaveBeenCalledTimes(1);
    });
  });

  it('toggles emotion selection when chip is pressed', async () => {
    const { getAllByTestId, getByTestId } = render(
      <EmotionLogScreen navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      const emotionChips = getAllByTestId('emotion-chip');
      expect(emotionChips.length).toBe(2);
      
      // 감정 칩 클릭 전 제출 버튼 상태 확인
      const submitButton = getByTestId('emotion-submit-button');
      expect(submitButton.props.disabled).toBeTruthy();
      
      // 첫 번째 감정 선택
      fireEvent.press(emotionChips[0]);
      
      // 감정 선택 후 제출 버튼 상태 변화 확인
      expect(submitButton.props.disabled).toBeFalsy();
      
      // 같은 감정 다시 클릭하여 선택 해제
      fireEvent.press(emotionChips[0]);
      
      // 감정 선택 해제 후 제출 버튼 상태 확인
      expect(submitButton.props.disabled).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('handles text input for emotion note', async () => {
    const { getByTestId } = render(
      <EmotionLogScreen navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      const noteInput = getByTestId('emotion-note-input');
      
      // 메모 입력
      const testNote = '오늘은 정말 행복한 하루였습니다';
      fireEvent.changeText(noteInput, testNote);
      
      // 입력값 확인
      expect(noteInput.props.value).toBe(testNote);
    });
  });

  it('shows alert when trying to submit without selecting emotions', async () => {
    const { getByTestId } = render(
      <EmotionLogScreen navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      const submitButton = getByTestId('emotion-submit-button');
      
      // 감정 선택 없이 제출 버튼 클릭 시도
      // 참고: 실제로는 버튼이 disabled 상태이지만 내부 로직 검증용
      fireEvent.press(submitButton);
      
      // 경고 알림 확인
      expect(alertMock).toHaveBeenCalledWith(
        '알림',
        '감정을 적어도 하나 이상 선택해주세요.'
      );
    });
  });

  it('successfully records emotions and navigates back on completion', async () => {
    // recordEmotions 성공 모킹
    (emotionService.recordEmotions as jest.Mock).mockResolvedValue({
      data: { status: 'success' }
    });
    
    const { getAllByTestId, getByTestId } = render(
      <EmotionLogScreen navigation={mockNavigation} />
    );
    
    // 감정 선택 및 제출 테스트
    await waitFor(() => {
      const emotionChips = getAllByTestId('emotion-chip');
      const noteInput = getByTestId('emotion-note-input');
      const submitButton = getByTestId('emotion-submit-button');
      
      // 감정 선택
      fireEvent.press(emotionChips[0]);
      
      // 메모 입력
      const testNote = '오늘의 행복한 순간들';
      fireEvent.changeText(noteInput, testNote);
      
      // 제출
      fireEvent.press(submitButton);
    });
    
    // 제출 결과 확인
    await waitFor(() => {
      // 감정 기록 API 호출 확인
      expect(emotionService.recordEmotions).toHaveBeenCalledWith({
        emotion_ids: [1],
        note: '오늘의 행복한 순간들'
      });
      
      // 성공 알림 확인
      expect(alertMock).toHaveBeenCalledWith(
        '감정 기록 완료',
        '오늘의 감정이 성공적으로 기록되었습니다.',
        expect.arrayContaining([
          expect.objectContaining({ text: '확인' })
        ])
      );
      
      // 화면 이동 확인
      // 알림 콜백 시뮬레이션 - 타입 안전하게 수정
      const lastCall = alertMock.mock.calls[alertMock.mock.calls.length - 1];
      if (lastCall && lastCall.length > 2 && Array.isArray(lastCall[2])) {
        const buttons = lastCall[2];
        const confirmButton = buttons.find(button => button && typeof button === 'object' && button.text === '확인');
        if (confirmButton && confirmButton.onPress) {
          confirmButton.onPress();
          expect(mockNavigation.goBack).toHaveBeenCalled();
        }
      }
    });
  });
  it('handles recordEmotions API error', async () => {
    // recordEmotions 실패 모킹
    const errorMessage = '네트워크 오류가 발생했습니다';
    (emotionService.recordEmotions as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: errorMessage
        }
      }
    });
    
    const { getAllByTestId, getByTestId } = render(
      <EmotionLogScreen navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      const emotionChips = getAllByTestId('emotion-chip');
      const submitButton = getByTestId('emotion-submit-button');
      
      // 감정 선택
      fireEvent.press(emotionChips[0]);
      
      // 제출
      fireEvent.press(submitButton);
    });
    
    // 에러 알림 확인
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        '오류',
        errorMessage
      );
      
      // 화면이 이동하지 않음을 확인
      expect(mockNavigation.goBack).not.toHaveBeenCalled();
    });
  });

  it('handles API loading states correctly', async () => {
    // getAllEmotions 지연 시뮬레이션
    (emotionService.getAllEmotions as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: {
              status: 'success',
              data: mockEmotions
            }
          });
        }, 100);
      });
    });
    
    const { queryByText, getByTestId } = render(
      <EmotionLogScreen navigation={mockNavigation} />
    );
    
    // 로딩 상태 확인
    expect(queryByText('감정 데이터를 불러오는 중...')).toBeTruthy();
    
    // 로딩 완료 후 화면 확인
    await waitFor(() => {
      expect(getByTestId('emotion-submit-button')).toBeTruthy();
    });
  });

  it('handles getAllEmotions API error', async () => {
    // getAllEmotions 실패 모킹
    (emotionService.getAllEmotions as jest.Mock).mockRejectedValue(new Error('API 에러'));

    render(<EmotionLogScreen navigation={mockNavigation} />);

    // Alert.alert가 호출되는데 충분한 시간 제공
    await waitFor(
      () => {
        expect(alertMock).toHaveBeenCalledWith(
          '오류',
          '감정 데이터를 불러오는 중 오류가 발생했습니다.'
        );
      },
      { timeout: 5000 }
    );
  });
});